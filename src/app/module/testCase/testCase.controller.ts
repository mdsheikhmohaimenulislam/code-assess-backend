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

// // Get all
// const getTestCases = async (
//   req: Request,
//   res: Response
// ) => {
//   const userId = req.user!.userId;
//   const userRole = req.user!.role;

//   const { problemId } = req.params;

//   const result = await TestCaseService.getTestCases(
//     userId,
//     userRole,
//     problemId
//   );

//   res.status(200).json({
//     success: true,
//     message: "Test cases retrieved successfully",
//     data: result,
//   });
// };

// // Get single
// const getTestCaseById = async (
//   req: Request,
//   res: Response
// ) => {
//   const userId = req.user!.userId;
//   const userRole = req.user!.role;

//   const { id } = req.params;

//   const result = await TestCaseService.getTestCaseById(
//     userId,
//     userRole,
//     id
//   );

//   res.status(200).json({
//     success: true,
//     message: "Test case retrieved successfully",
//     data: result,
//   });
// };

// // Update
// const updateTestCase = async (
//   req: Request,
//   res: Response
// ) => {
//   const userId = req.user!.userId;
//   const userRole = req.user!.role;

//   const { id } = req.params;

//   const result = await TestCaseService.updateTestCase(
//     userId,
//     userRole,
//     id,
//     req.body
//   );

//   res.status(200).json({
//     success: true,
//     message: "Test case updated successfully",
//     data: result,
//   });
// };

// // Delete
// const deleteTestCase = async (
//   req: Request,
//   res: Response
// ) => {
//   const userId = req.user!.userId;
//   const userRole = req.user!.role;

//   const { id } = req.params;

//   const result = await TestCaseService.deleteTestCase(
//     userId,
//     userRole,
//     id
//   );

//   res.status(200).json({
//     success: true,
//     message: "Test case deleted successfully",
//     data: result,
//   });
// };

export const TestCaseController = {
  createTestCase,
  //   getTestCases,
  //   getTestCaseById,
  //   updateTestCase,
  //   deleteTestCase,
};
