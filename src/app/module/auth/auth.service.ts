import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";
import { AppError } from "../../utils/AppError.js";
import type {
  ILoginUserPayload,
  IRegisterPayload,
  IVerifyEmailPayload,
} from "./auth.interface.js";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { redisClient } from "../../lib/redis.js";
import path from "path";
import { transporter } from "../../lib/nodemailer.js";
import config from "../../config/index.js";
import { Role, UserStatus } from "../../../generated/prisma/enums.js";
import { jwtUtils } from "../../utils/jwt.js";
import type { SignOptions } from "jsonwebtoken";

const register = async (payload: IRegisterPayload) => {
  const { name, password } = payload;

  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this email already exists",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const expirationSeconds = 5 * 60;

  const otpValue = crypto.randomInt(100000, 1000000).toString();

  const otpkey = `User-registration-otp:${email}`;

  await redisClient.set(otpkey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const Registrationkey = `User-registration-data:${email}`;

  const redisUserDataPayload = {
    name,
    email,
    password: hashedPassword,
  };

  await redisClient.set(Registrationkey, JSON.stringify(redisUserDataPayload), {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const tempatePath = path.join(
    process.cwd(),
    "src/app/templates/registration-user-otp.ejs",
  );

  const templateData = {
    name,
    email,
    otp: otpValue,
    expirationMinutes: expirationSeconds / 60,
    year: new Date().getFullYear(),
  };

  try {
    const html = await ejs.renderFile(tempatePath, templateData);

    await transporter.sendMail({
      from: config.email_sender,
      to: email,
      subject: "Email Verification",
      html,
    });
  } catch (error) {
    console.error(error);

    throw error;
  }
};

const verifyEmail = async (payload: IVerifyEmailPayload) => {
  try {
    // VERIFY EMAIL START
    const otp = payload.otp;
    const email = payload.email.trim().toLowerCase();

    const isUserExist = await prisma.user.findUnique({
      where: { email },
    });

    if (isUserExist?.emailVerified) {
      throw new AppError(httpStatus.CONFLICT, "Email Already Verified");
    }

    if (isUserExist?.isDeleted || isUserExist?.status === "DELETED") {
      throw new AppError(httpStatus.GONE, "User is Deleted");
    }

    if (isUserExist?.status === "BLOCKED") {
      throw new AppError(httpStatus.FORBIDDEN, "User is Blocked");
    }

    if (isUserExist?.status === "INACTIVE") {
      throw new AppError(httpStatus.FORBIDDEN, "User is Inactive");
    }

    // OTP
    const otpKey = `User-registration-otp:${email}`;
    const redisOtp = await redisClient.get(otpKey);

    if (!redisOtp) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid or Expired OTP");
    }

    if (redisOtp !== otp) {
      throw new AppError(httpStatus.BAD_REQUEST, "OTP Does Not Match");
    }

    // Registration Data
    const registrationKey = `User-registration-data:${email}`;
    const redisUserData = await redisClient.get(registrationKey);

    if (!redisUserData) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Registration data not found or expired",
      );
    }

    const userPayload: IRegisterPayload = JSON.parse(redisUserData);

    // Create User

    const createdUser = await prisma.user.create({
      data: {
        name: userPayload.name,
        email: userPayload.email,
        password: userPayload.password,
        role: Role.CANDIDATE,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },

      omit: {
        password: true,
      },
    });

    // Delete Redis
    await redisClient.del(otpKey);
    await redisClient.del(registrationKey);

    // Welcome Email
    const templatePath = path.join(
      process.cwd(),
      "src/app/templates/user-welcome-email.ejs",
    );

    const templateData = {
      name: createdUser.name,
      year: new Date().getFullYear(),
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
      from: config.email_sender,
      to: email,
      subject: "Welcome To Code Assess System",
      html,
    });

    // JWT
    const jwtPayload = {
      userId: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    };

    const accessToken = jwtUtils.createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
      jwtPayload,
      config.jwt_refresh_secret,
      config.jwt_refresh_expires_in as SignOptions,
    );

    return {
      user: createdUser,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error(error);

    throw error;
  }
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  console.log(email, password);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(httpStatus.GONE, "User is deleted");
  }

  if (user.password === null && user.googleId !== null) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User Already Has Account Registered With Google. Try To Login With Google.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string,
  );

  console.log("is passwormatched");

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  console.log("jwt payload");

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  console.log("access token");

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

console.log("refresh Token");

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  register,
  verifyEmail,
  loginUser,
};
