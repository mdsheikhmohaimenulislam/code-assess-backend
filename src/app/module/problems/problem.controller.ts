import { response, type Request, type Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { ProblemService } from "./problem.service.js";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

const createProblem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const result = await ProblemService.createProblem(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Problem created successfully",
    data: result,
  });
});

const getProblems = catchAsync(async (req: Request, res: Response) => {
  const result = await ProblemService.getProblems(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Problems retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getProblemById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProblemService.getProblemById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Problem retrieved successfully",
    data: result,
  });
});

const updateProblem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  const { id } = req.params;

  if (!userId || !userRole) {
    throw new AppError(401, "Unauthorized");
  }

  const result = await ProblemService.updateProblem(
    userId,
    userRole,
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Problem updated successfully",
    data: result,
  });
});

const deleteProblem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { id: problemId } = req.params;

  if (!userId || !userRole) {
    throw new AppError(401, "Unauthorized");
  }

  if (!problemId) {
    throw new AppError(400, "Problem ID is required");
  }

  await ProblemService.deleteProblem(userId, userRole, problemId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Problem permanently deleted successfully",
    data: null,
  });
});

export const ProblemController = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
