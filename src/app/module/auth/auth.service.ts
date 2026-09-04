import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";
import { AppError } from "../../utils/AppError.js";
import type {
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
    console.log("========== VERIFY EMAIL START ==========");

    const otp = payload.otp;
    const email = payload.email.trim().toLowerCase();

    console.log("Email:", email);
    console.log("OTP received:", otp);

    const isUserExist = await prisma.user.findUnique({
      where: { email },
    });

    console.log("Existing user:", isUserExist ? "YES" : "NO");

    if (isUserExist?.emailVerified) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Email Already Verified",
      );
    }

    if (
      isUserExist?.isDeleted ||
      isUserExist?.status === "DELETED"
    ) {
      throw new AppError(
        httpStatus.GONE,
        "User is Deleted",
      );
    }

    if (isUserExist?.status === "BLOCKED") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "User is Blocked",
      );
    }

    if (isUserExist?.status === "INACTIVE") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "User is Inactive",
      );
    }

    // =========================
    // OTP
    // =========================

    const otpKey = `User-registration-otp:${email}`;

    console.log("OTP Redis Key:", otpKey);

    const redisOtp = await redisClient.get(otpKey);

    console.log(
      "Redis OTP exists:",
      redisOtp ? "YES" : "NO",
    );

    if (!redisOtp) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid or Expired OTP",
      );
    }

    if (redisOtp !== otp) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "OTP Does Not Match",
      );
    }

    console.log("OTP matched successfully");

    // =========================
    // Registration Data
    // =========================

    const registrationKey =
      `User-registration-data:${email}`;

    console.log(
      "Registration Redis Key:",
      registrationKey,
    );

    const redisUserData =
      await redisClient.get(registrationKey);

    console.log(
      "Registration data exists:",
      redisUserData ? "YES" : "NO",
    );

    if (!redisUserData) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Registration data not found or expired",
      );
    }

    const userPayload: IRegisterPayload =
      JSON.parse(redisUserData);

    console.log("Registration data loaded");

    // =========================
    // Create User
    // =========================

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

    console.log("User created:", createdUser.id);

    // =========================
    // Delete Redis
    // =========================

    await redisClient.del(otpKey);
    await redisClient.del(registrationKey);

    console.log("Redis data deleted");

    // =========================
    // Welcome Email
    // =========================

    const templatePath = path.join(
      process.cwd(),
      "src/app/templates/user-welcome-email.ejs",
    );

    console.log("Template path:", templatePath);

    const templateData = {
      name: createdUser.name,
      year: new Date().getFullYear(),
    };

    const html = await ejs.renderFile(
      templatePath,
      templateData,
    );

    console.log("EJS rendered successfully");

    await transporter.sendMail({
      from: config.email_sender,
      to: email,
      subject: "Welcome To Code Assess System",
      html,
    });

    console.log("Welcome email sent");

    // =========================
    // JWT
    // =========================

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

    console.log("JWT created successfully");
    console.log("========== VERIFY EMAIL END ==========");

    return {
      user: createdUser,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("========== VERIFY EMAIL ERROR ==========");
    console.error(error);
    console.error("========================================");

    throw error;
  }
};

export const AuthService = {
  register,
  verifyEmail,
};
