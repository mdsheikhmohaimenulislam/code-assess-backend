import type { Request, Response } from "express";
import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { SubmissionService } from "./submission.service.js";

// GET all submissions
const getAllSubmissions = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await SubmissionService.getAllSubmissions();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submissions retrieved successfully",
      data: result,
    });
  },
);

// GET submission by ID
const getSubmissionById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Submission ID is required",
      );
    }

    const result =
      await SubmissionService.getSubmissionById(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submission retrieved successfully",
      data: result,
    });
  },
);

// GET logged-in candidate's submissions
const getMySubmissions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const result =
      await SubmissionService.getMySubmissions(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Your submissions retrieved successfully",
      data: result,
    });
  },
);

// PATCH submission
const updateSubmission = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Submission ID is required",
      );
    }

    const result = await SubmissionService.updateSubmission(
      id as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submission updated successfully",
      data: result,
    });
  },
);

export const SubmissionController = {
  getAllSubmissions,
  getSubmissionById,
  getMySubmissions,
  updateSubmission,
};