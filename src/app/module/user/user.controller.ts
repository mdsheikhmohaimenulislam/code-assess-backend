import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
import { UserService } from "./user.service.js";

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



const getAllUsers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getAllUsers(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  },
);




export const UserController = {
    getAllUsers,
  //   getMyProfile,
  //   updateMyProfile,
  getSingleUser,
  //   updateUserStatus,
  //   deleteUser,
};
