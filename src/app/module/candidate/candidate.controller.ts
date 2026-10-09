import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { CandidateService } from "./candidate.service.js";

const getAllCandidate = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CandidateService.getAllCandidate();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All candidates retrieved successfully",
      data: result,
    });
  },
);

const createCandidate = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const result = await CandidateService.createCandidate(
      userId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Candidate profile created successfully",
      data: result,
    });
  },
);

const getMyCandidate = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const result =
      await CandidateService.getMyCandidate(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Candidate profile retrieved successfully",
      data: result,
    });
  },
);

const getCandidateById = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.params.id;

    if (!candidateId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Candidate ID is required",
      );
    }

    const result =
      await CandidateService.getCandidateById(candidateId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Candidate profile retrieved successfully",
      data: result,
    });
  },
);

const updateCandidate = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const candidateId = req.params.id;

    if (!candidateId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Candidate ID is required",
      );
    }

    const result =
      await CandidateService.updateCandidate(
        userId,
        candidateId as string,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Candidate profile updated successfully",
      data: result,
    });
  },
);

const deleteCandidate = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const candidateId = req.params.id;

    if (!candidateId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Candidate ID is required",
      );
    }

    await CandidateService.deleteCandidate(
      userId,
      candidateId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Candidate profile deleted successfully",
      data: null,
    });
  },
);

export const CandidateController = {
  createCandidate,
  getMyCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getAllCandidate,
};