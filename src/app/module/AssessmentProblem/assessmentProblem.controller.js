import { catchAsync } from "../../utils/catchAsync.js";
import { AssessmentProblemService } from "./assessmentProblem.service.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse.js";
const createAssessmentProblem = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	const { id } = req.params;
	// console.log(req.params);
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	if (!id) {
		throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
	}
	const result = await AssessmentProblemService.createAssessmentProblem(
		userId,
		userRole,
		id,
		req.body,
	);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Problem added to assessment successfully",
		data: result,
	});
});
const getAssessmentProblems = catchAsync(async (req, res) => {
	const { id } = req.params;
	// console.log(id);
	if (!id) {
		throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
	}
	const result = await AssessmentProblemService.getAssessmentProblems(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Assessment problems retrieved successfully",
		data: result,
	});
});
const getAssessmentProblemById = catchAsync(async (req, res) => {
	const { id } = req.params;
	// console.log(req.params);
	if (!id) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Assessment problem ID is required",
		);
	}
	const result = await AssessmentProblemService.getAssessmentProblemById(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Assessment problem retrieved successfully",
		data: result,
	});
});
const updateAssessmentProblem = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	const { id } = req.params;
	// console.log( id);
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const result = await AssessmentProblemService.updateAssessmentProblem(
		userId,
		userRole,
		id,
		req.body,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Assessment problem updated successfully",
		data: result,
	});
});
const deleteAssessmentProblem = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	const { id } = req.params;
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	if (!id) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Assessment problem ID is required",
		);
	}
	await AssessmentProblemService.deleteAssessmentProblem(userId, userRole, id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Problem removed from assessment successfully",
		data: null,
	});
});
export const AssessmentProblemController = {
	createAssessmentProblem,
	getAssessmentProblems,
	getAssessmentProblemById,
	updateAssessmentProblem,
	deleteAssessmentProblem,
};
//# sourceMappingURL=assessmentProblem.controller.js.map
