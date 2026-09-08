import { catchAsync } from "../../utils/catchAsync.js";
import { CompanyService } from "./company.service.js";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
// Create company
const createCompany = catchAsync(async (req, res) => {
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
// Get own company
const getMyCompany = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const result = await CompanyService.getMyCompany(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Company profile retrieved successfully",
        data: result,
    });
});
// Get company by ID
const getCompanyById = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError(httpStatus.BAD_REQUEST, "Company ID is required");
    }
    const result = await CompanyService.getCompanyById(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Company profile retrieved successfully",
        data: result,
    });
});
// Update company
const updateCompany = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { id } = req.params;
    if (!userId || !userRole) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    if (!id) {
        throw new AppError(httpStatus.BAD_REQUEST, "Company ID is required");
    }
    const result = await CompanyService.updateCompany(userId, userRole, id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Company profile updated successfully",
        data: result,
    });
});
// Delete company
const deleteCompany = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { id } = req.params;
    if (!userId || !userRole) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    if (!id) {
        throw new AppError(httpStatus.BAD_REQUEST, "Company ID is required");
    }
    await CompanyService.deleteCompany(userId, userRole, id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Company profile deleted successfully",
        data: null,
    });
});
export const CompanyController = {
    createCompany,
    getMyCompany,
    getCompanyById,
    updateCompany,
    deleteCompany,
};
//# sourceMappingURL=company.controller.js.map