import { catchAsync } from "../../utils/catchAsync.js";
import { CandidateService } from "./candidate.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from 'http-status';
import { AppError } from "../../utils/AppError.js";
const createCandidate = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const result = await CandidateService.createCandidate(userId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Candidate profile created successfully",
        data: result,
    });
});
const getMyCandidate = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const result = await CandidateService.getMyCandidate(userId);
    res.status(httpStatus.OK).json({
        success: true,
        message: "Candidate profile retrieved successfully",
        data: result,
    });
});
const getCandidateById = catchAsync(async (req, res) => {
    const candidateId = req.params.id;
    if (!candidateId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Candidate ID is required");
    }
    const result = await CandidateService.getCandidateById(candidateId);
    res.status(httpStatus.OK).json({
        success: true,
        message: "Candidate profile retrieved successfully",
        data: result,
    });
});
const updateCandidate = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const candidateId = req.params.id;
    if (!candidateId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Candidate ID is required");
    }
    const result = await CandidateService.updateCandidate(userId, candidateId, req.body);
    res.status(httpStatus.OK).json({
        success: true,
        message: "Candidate profile updated successfully",
        data: result,
    });
});
const deleteCandidate = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const candidateId = req.params.id;
    if (!candidateId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Candidate ID is required");
    }
    await CandidateService.deleteCandidate(userId, candidateId);
    res.status(httpStatus.OK).json({
        success: true,
        message: "Candidate profile deleted successfully",
        data: null,
    });
});
export const CandidateController = {
    createCandidate,
    getMyCandidate,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
};
//# sourceMappingURL=candidate.controller.js.map