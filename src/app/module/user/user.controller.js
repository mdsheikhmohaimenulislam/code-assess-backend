import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
import { UserService } from "./user.service.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
const getSingleUser = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await UserService.getSingleUser(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result,
    });
});
const getAllUsers = catchAsync(async (req, res) => {
    const result = await UserService.getAllUsers(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result,
    });
});
const updateMyProfile = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await UserService.updateMyProfile(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});
const updateUserStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserService.updateUserStatus(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile updated successfully",
        data: result,
    });
});
const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    await UserService.deleteUser(id);
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: null,
    });
});
const permanentlyDeleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    await UserService.permanentlyDeleteUser(id);
    res.status(200).json({
        success: true,
        message: "User permanently deleted successfully",
        data: null,
    });
});
export const UserController = {
    getAllUsers,
    permanentlyDeleteUser,
    updateMyProfile,
    getSingleUser,
    updateUserStatus,
    deleteUser,
};
//# sourceMappingURL=user.controller.js.map