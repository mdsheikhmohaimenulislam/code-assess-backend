import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
import { AttemptService } from "./attempt.service.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
const createAttempt = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const { assessmentId } = req.body;
	const result = await AttemptService.createAttempt(userId, assessmentId);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Assessment attempt started successfully",
		data: result,
	});
});
const getAttempts = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const result = await AttemptService.getAttempts({
		userId,
		userRole,
		page,
		limit,
	});
	res.status(httpStatus.OK).json({
		success: true,
		message: "Attempts retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});
const getAttemptById = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	const { id } = req.params;
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	if (!id) {
		throw new AppError(httpStatus.BAD_REQUEST, "Attempt ID is required");
	}
	const result = await AttemptService.getAttemptById(userId, userRole, id);
	res.status(httpStatus.OK).json({
		success: true,
		message: "Attempt retrieved successfully",
		data: result,
	});
});
const submitAttempt = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const { id } = req.params;
	if (!id) {
		throw new AppError(httpStatus.BAD_REQUEST, "Attempt ID is required");
	}
	const result = await AttemptService.submitAttempt(userId, id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Assessment submitted successfully",
		data: result,
	});
});
export const AttemptController = {
	createAttempt,
	getAttempts,
	getAttemptById,
	submitAttempt,
};
//# sourceMappingURL=attempt.controller.js.map
