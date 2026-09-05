import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
import { UserService } from "./user.service.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await UserService.getSingleUser(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await UserService.updateMyProfile(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await UserService.updateUserStatus(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await UserService.deleteUser(id as string);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

const permanentlyDeleteUser = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await UserService.permanentlyDeleteUser(id as string);

    res.status(200).json({
      success: true,
      message: "User permanently deleted successfully",
      data: null,
    });
  },
);

export const UserController = {
  getAllUsers,
  permanentlyDeleteUser,
  updateMyProfile,
  getSingleUser,
  updateUserStatus,
  deleteUser,
};
