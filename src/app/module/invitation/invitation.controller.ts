import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { InvitationService } from "./invitation.service.js";
import httpStatus from 'http-status';
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";



const createInvitation = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const result =
      await InvitationService.createInvitation(
        userId,
        userRole,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Invitation created successfully",
      data: result,
    });
  },
);



// const getInvitations = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const userRole = req.user!.role;

//     const result = await InvitationService.getInvitations(
//       userId,
//       userRole,
//       req.query
//     );

//     res.status(200).json({
//       success: true,
//       message: "Invitations retrieved successfully",
//       data: result.data,
//       meta: result.meta,
//     });
//   }
// );


// const getInvitationById = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const userRole = req.user!.role;

//     const result = await InvitationService.getInvitationById(
//       userId,
//       userRole,
//       req.params.id
//     );

//     res.status(200).json({
//       success: true,
//       message: "Invitation retrieved successfully",
//       data: result,
//     });
//   }
// );


// const acceptInvitation = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;

//     const result = await InvitationService.acceptInvitation(
//       userId,
//       req.params.id
//     );

//     res.status(200).json({
//       success: true,
//       message: "Invitation accepted successfully",
//       data: result,
//     });
//   }
// );


// const rejectInvitation = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;

//     const result = await InvitationService.rejectInvitation(
//       userId,
//       req.params.id
//     );

//     res.status(200).json({
//       success: true,
//       message: "Invitation rejected successfully",
//       data: result,
//     });
//   }
// );


// const deleteInvitation = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;
//     const userRole = req.user!.role;

//     const result = await InvitationService.deleteInvitation(
//       userId,
//       userRole,
//       req.params.id
//     );

//     res.status(200).json({
//       success: true,
//       message: "Invitation deleted successfully",
//       data: result,
//     });
//   }
// );

export const InvitationController = {
  createInvitation,
//   getInvitations,
//   getInvitationById,
//   acceptInvitation,
//   rejectInvitation,
//   deleteInvitation,
};