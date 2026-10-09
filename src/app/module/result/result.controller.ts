import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ResultService } from "./result.service.js";



const createResult = catchAsync(
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

    const result = await ResultService.createResult(
      userId,
      assessmentId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Result created successfully",
      data: result,
    });
  },
);

const getResultById = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    if (!id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Result ID is required",
      );
    }

    const result = await ResultService.getResultById(
      userId,
      id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Result retrieved successfully",
      data: result,
    });
  },
);

const getMyResults = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const results = await ResultService.getMyResults(
      userId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Results retrieved successfully",
      data: results,
    });
  },
);

const getAssessmentResults = catchAsync(
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

    const results =
      await ResultService.getAssessmentResults(
        userId,
        assessmentId as string,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Assessment results retrieved successfully",
      data: results,
    });
  },
);

export const ResultController = {
  createResult,
  getResultById,
  getMyResults,
  getAssessmentResults,
};