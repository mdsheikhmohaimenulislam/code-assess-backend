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

const getAssessmentById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Assessment ID is required",
      );
    }

    const result =
      await AssessmentService.getAssessmentById(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Assessment retrieved successfully",
      data: result,
    });
  },
);


const updateAssessment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId || !userRole) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    if (!id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Assessment ID is required",
      );
    }

    const result =
      await AssessmentService.updateAssessment(
        userId,
        userRole,
        id as string,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Assessment updated successfully",
      data: result,
    });
  },
);

const deleteAssessment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId || !userRole) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    if (!id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Assessment ID is required",
      );
    }


      await AssessmentService.deleteAssessment(
        userId,
        userRole,
        id as string,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Assessment deleted successfully",
      data: null,
    });
  },
);





const updateAssessmentStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId || !userRole) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    if (!id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Assessment ID is required",
      );
    }

    const result =
      await AssessmentService.updateAssessmentStatus(
        userId,
        userRole,
        id as string,
        status,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Assessment ${status.toLowerCase()} successfully`,
      data: result,
    });
  },
);

export const AssessmentController = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
updateAssessmentStatus
};