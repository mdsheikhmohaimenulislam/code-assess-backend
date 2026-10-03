import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";

import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { jwtUtils } from "../utils/jwt.js";
import config from "../config/index.js";
import type { Role } from "../../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

export interface RequestUser {
  email: string;
  name: string;
  userId: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not logged in. Please log in to access this resource.",
      );
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new AppError(httpStatus.UNAUTHORIZED, verifiedToken.error);
    }

    const { email, name, userId, role } = verifiedToken.data as JwtPayload & {
      userId: string;
      name: string;
      email: string;
      role: Role;
    };

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid authentication token.",
      );
    }

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource.",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "User not found. Please log in again.",
      );
    }

    if (user.status === "BLOCKED") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account has been blocked. Please contact support.",
      );
    }

    req.user = {
      email: user.email,
      name: user.name,
      userId: user.id,
      role: user.role,
    };

    next();
  });
};
