import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AnswerService } from "./answer.service.js";

const submitAnswer = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { assessmentId } = req.params;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    if (!assessmentId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Assessment ID is required",
      );
    }

    const result = await AnswerService.submitAnswer(
      userId,
      assessmentId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Answer submitted successfully",
      data: result,
    });
  },
);

export const AnswerController = {
  submitAnswer,
};