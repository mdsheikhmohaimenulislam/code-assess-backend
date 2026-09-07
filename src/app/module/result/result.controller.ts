import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from 'http-status';
import { ResultService } from "./result.service.js";
import { sendResponse } from "../../utils/sendResponse.js";


const createResult = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const { id: attemptId } = req.params;

    if (!userId || !userRole) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    if (!attemptId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Attempt ID is required",
      );
    }

    const result = await ResultService.createResult(
      attemptId as string,
      userId,
      userRole,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Result created successfully",
      data: result,
    });
  },
);


// const getResultByAttempt = async (
//   req: Request,
//   res: Response
// ) => {
//   const result =
//     await ResultService.getResultByAttempt(
//       req.user!.userId,
//       req.user!.role,
//       req.params.attemptId
//     );

//   res.status(200).json({
//     success: true,
//     message: "Result retrieved successfully",
//     data: result,
//   });
// };

// const getResultById = async (
//   req: Request,
//   res: Response
// ) => {
//   const result = await ResultService.getResultById(
//     req.user!.userId,
//     req.user!.role,
//     req.params.id
//   );

//   res.status(200).json({
//     success: true,
//     message: "Result retrieved successfully",
//     data: result,
//   });
// };

// const getResults = async (
//   req: Request,
//   res: Response
// ) => {
//   const result = await ResultService.getResults(
//     req.user!.userId,
//     req.user!.role
//   );

//   res.status(200).json({
//     success: true,
//     message: "Results retrieved successfully",
//     data: result,
//   });
// };

export const ResultController = {
  createResult,
//   getResultByAttempt,
//   getResultById,
//   getResults,
};