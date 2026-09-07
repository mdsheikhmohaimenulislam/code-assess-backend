import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
import { TestCaseService } from "./testCase.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createTestCase = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  console.log("Logged in userId:", userId);
  console.log("Logged in role:", userRole);

  if (!userId || !userRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const { id } = req.params;

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Problem ID is required");
  }

  const result = await TestCaseService.createTestCase(
    userId,
    userRole,
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Test case created successfully",
    data: result,
  });
});

const getTestCases = catchAsync(async (req: Request, res: Response) => {
  console.log("🔥 ROUTE HIT");
  console.log("PARAMS:", req.params);

  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { id } = req.params;

  if (!userId || !userRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Problem ID is required");
  }

  const result = await TestCaseService.getTestCase(
    userId,
    userRole,
    id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Test cases retrieved successfully",
    data: result,
  });
});

// Update Test Case
const updateTestCase = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { id } = req.params;

  if (!userId || !userRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Test case ID is required");
  }

  const result = await TestCaseService.updateTestCase(
    userId,
    userRole,
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Test case updated successfully",
    data: result,
  });
});

// Delete
const deleteTestCase = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { id } = req.params;

  if (!userId || !userRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Test case ID is required");
  }

  await TestCaseService.deleteTestCase(userId, userRole, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Test case deleted successfully",
    data: null,
  });
});
export const TestCaseController = {
  createTestCase,
  getTestCases,

  updateTestCase,
  deleteTestCase,
};
