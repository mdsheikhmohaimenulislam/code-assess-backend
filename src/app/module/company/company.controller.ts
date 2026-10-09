import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { CompanyService } from "./company.service.js";

const createCompany = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const result = await CompanyService.createCompany(
      userId,
      userRole,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Company profile created successfully",
      data: result,
    });
  },
);

const getMyCompany = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const result =
      await CompanyService.getMyCompany(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Company profile retrieved successfully",
      data: result,
    });
  },
);

const getCompanyById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Company ID is required",
      );
    }

    const result =
      await CompanyService.getCompanyById(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Company profile retrieved successfully",
      data: result,
    });
  },
);

const updateCompany = catchAsync(
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
        "Company ID is required",
      );
    }

    const result =
      await CompanyService.updateCompany(
        userId,
        userRole,
        id as string,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Company profile updated successfully",
      data: result,
    });
  },
);

const deleteCompany = catchAsync(
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
        "Company ID is required",
      );
    }

    await CompanyService.deleteCompany(
      userId,
      userRole,
      id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Company profile deleted successfully",
      data: null,
    });
  },
);

const getAllCompanies = catchAsync(
  async (_req: Request, res: Response) => {
    const result =
      await CompanyService.getAllCompanies();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Companies retrieved successfully",
      data: result,
    });
  },
);

export const CompanyController = {
  createCompany,
  getMyCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getAllCompanies,
};