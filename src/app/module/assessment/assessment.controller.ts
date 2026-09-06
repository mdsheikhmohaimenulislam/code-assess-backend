import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AssessmentService } from "./assessment.service.js";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from 'http-status';


const createAssessment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      throw new AppError(401, "Unauthorized");
    }

    const result = await AssessmentService.createAssessment(
      userId,
      userRole,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Assessment created successfully",
      data: result,
    });
  },
);

const getAssessments = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await AssessmentService.getAssessments(
        req.query as Record<string, unknown>,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Assessments retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

// const getAssessmentById = catchAsync(
//   async (req: Request, res: Response) => {
//     const result = await AssessmentService.getAssessmentById(
//       req.params.id,
//     );

//     res.status(200).json({
//       success: true,
//       message: "Assessment retrieved successfully",
//       data: result,
//     });
//   },
// );

// const updateAssessment = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const userRole = req.user!.role;

//     const result = await AssessmentService.updateAssessment(
//       userId,
//       userRole,
//       req.params.id,
//       req.body,
//     );

//     res.status(200).json({
//       success: true,
//       message: "Assessment updated successfully",
//       data: result,
//     });
//   },
// );

// const deleteAssessment = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const userRole = req.user!.role;

//     const result = await AssessmentService.deleteAssessment(
//       userId,
//       userRole,
//       req.params.id,
//     );

//     res.status(200).json({
//       success: true,
//       message: "Assessment deleted successfully",
//       data: result,
//     });
//   },
// );

// const publishAssessment = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const userRole = req.user!.role;

//     const result = await AssessmentService.publishAssessment(
//       userId,
//       userRole,
//       req.params.id,
//     );

//     res.status(200).json({
//       success: true,
//       message: "Assessment published successfully",
//       data: result,
//     });
//   },
// );

// const cancelAssessment = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const userRole = req.user!.role;

//     const result = await AssessmentService.cancelAssessment(
//       userId,
//       userRole,
//       req.params.id,
//     );

//     res.status(200).json({
//       success: true,
//       message: "Assessment cancelled successfully",
//       data: result,
//     });
//   },
// );

// const completeAssessment = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const userRole = req.user!.role;

//     const result = await AssessmentService.completeAssessment(
//       userId,
//       userRole,
//       req.params.id,
//     );

//     res.status(200).json({
//       success: true,
//       message: "Assessment completed successfully",
//       data: result,
//     });
//   },
// );

export const AssessmentController = {
  createAssessment,
  getAssessments,
//   getAssessmentById,
//   updateAssessment,
//   deleteAssessment,
//   publishAssessment,
//   cancelAssessment,
//   completeAssessment,
};