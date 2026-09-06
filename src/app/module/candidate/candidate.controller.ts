import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { CandidateService } from "./candidate.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from 'http-status';
import { AppError } from "../../utils/AppError.js";



const createCandidate = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const result =
      await CandidateService.createCandidate(
        userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message:
        "Candidate profile created successfully",
      data: result,
    });
  },
);


const getMyCandidate = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
      );
    }

    const result =
      await CandidateService.getMyCandidate(userId);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Candidate profile retrieved successfully",
      data: result,
    });
  },
);


// const getCandidateById = catchAsync(
//   async (req: Request, res: Response) => {
//     const result = await CandidateService.getCandidateById(
//       req.params.id
//     );

//     res.status(200).json({
//       success: true,
//       message: "Candidate profile retrieved successfully",
//       data: result,
//     });
//   }
// );


// const updateCandidate = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;

//     const result = await CandidateService.updateCandidate(
//       userId,
//       req.params.id,
//       req.body
//     );

//     res.status(200).json({
//       success: true,
//       message: "Candidate profile updated successfully",
//       data: result,
//     });
//   }
// );


// const deleteCandidate = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.userId;

//     const result = await CandidateService.deleteCandidate(
//       userId,
//       req.params.id
//     );

//     res.status(200).json({
//       success: true,
//       message: "Candidate profile deleted successfully",
//       data: result,
//     });
//   }
// );

export const CandidateController = {
  createCandidate,
  getMyCandidate,
//   getCandidateById,
//   updateCandidate,
//   deleteCandidate,
};