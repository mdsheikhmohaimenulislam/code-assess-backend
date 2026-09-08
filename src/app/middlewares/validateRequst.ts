import { catchAsync } from "../utils/catchAsync.js";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import z from "zod";
import httpStatus from "http-status";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return catchAsync((req: Request, res: Response, next: NextFunction) => {
    // const payload = req.body ? req.body : {}
    const payload = req.body ?? {};

    const result = zodSchema.safeParse(payload);

    if (!result.success) {
      // console.log(result.error);
      // console.log(result.error.issues);

      const message = result.error.issues[0]?.message ?? "Validation failed";

      throw new AppError(httpStatus.BAD_REQUEST, message);
    }

    req.body = result.data;

    next();
  });
};
