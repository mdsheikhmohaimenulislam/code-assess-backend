import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";
import { AppError } from "../../utils/AppError.js";
import type { IRegisterPayload } from "./auth.interface.js";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { redisClient } from "../../lib/redis.js";
import path from "path";
import { transporter } from "../../lib/nodemailer.js";
import config from "../../config/index.js";

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

export const AuthService = {
  register,
};
