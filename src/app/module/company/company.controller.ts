import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { CompanyService } from "./company.service.js";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";

// Create company
const createCompany = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await CompanyService.createCompany(userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Company profile created successfully",
    data: result,
  });
});

// // Get own company
// const getMyCompany = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;

//     const result =
//       await CompanyService.getMyCompany(userId);

//     res.status(200).json({
//       success: true,
//       message: "Company profile retrieved successfully",
//       data: result,
//     });
//   },
// );

// // Get company by ID
// const getCompanyById = catchAsync(
//   async (req: Request, res: Response) => {
//     const { id } = req.params;

//     const result =
//       await CompanyService.getCompanyById(id);

//     res.status(200).json({
//       success: true,
//       message: "Company profile retrieved successfully",
//       data: result,
//     });
//   },
// );

// // Update company
// const updateCompany = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const { id } = req.params;

//     const result =
//       await CompanyService.updateCompany(
//         userId,
//         id,
//         req.body,
//       );

//     res.status(200).json({
//       success: true,
//       message: "Company profile updated successfully",
//       data: result,
//     });
//   },
// );

// // Delete company
// const deleteCompany = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const { id } = req.params;

//     const result =
//       await CompanyService.deleteCompany(
//         userId,
//         id,
//       );

//     res.status(200).json({
//       success: true,
//       message: "Company profile deleted successfully",
//       data: result,
//     });
//   },
// );

export const CompanyController = {
  createCompany,
  //   getMyCompany,
  //   getCompanyById,
  //   updateCompany,
  //   deleteCompany,
};
