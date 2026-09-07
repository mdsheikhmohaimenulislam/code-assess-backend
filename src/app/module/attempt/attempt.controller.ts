import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
import { AttemptService } from "./attempt.service.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import type { Request, Response } from "express";

const createAttempt = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const { assessmentId } = req.body;

  const result = await AttemptService.createAttempt(userId, assessmentId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Assessment attempt started successfully",
    data: result,
  });
});

// const getAttempts = async (
//   req: Request,
//   res: Response
// ) => {
//   const userId = req.user!.userId;
//   const userRole = req.user!.role;

//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;

//   const result = await AttemptService.getAttempts({
//     userId,
//     userRole,
//     page,
//     limit,
//   });

//   res.status(200).json({
//     success: true,
//     message: "Attempts retrieved successfully",
//     data: result.data,
//     meta: result.meta,
//   });
// };

// const getAttemptById = async (
//   req: Request,
//   res: Response
// ) => {
//   const userId = req.user!.userId;
//   const userRole = req.user!.role;

//   const { id } = req.params;

//   const result = await AttemptService.getAttemptById(
//     userId,
//     userRole,
//     id
//   );

//   res.status(200).json({
//     success: true,
//     message: "Attempt retrieved successfully",
//     data: result,
//   });
// };

// const submitAttempt = async (
//   req: Request,
//   res: Response
// ) => {
//   const userId = req.user!.userId;

//   const { id } = req.params;

//   const result = await AttemptService.submitAttempt(
//     userId,
//     id
//   );

//   res.status(200).json({
//     success: true,
//     message: "Assessment submitted successfully",
//     data: result,
//   });
// };

export const AttemptController = {
  createAttempt,
  //   getAttempts,
  //   getAttemptById,
  //   submitAttempt,
};
