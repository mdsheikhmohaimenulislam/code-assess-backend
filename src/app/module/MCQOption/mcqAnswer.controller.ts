import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { MCQAnswerService } from "./mcqAnswer.service.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse.js";

const createMCQAnswer = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	// console.log(userId);

	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}

	const result = await MCQAnswerService.createMCQAnswer(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "MCQ answer submitted successfully",
		data: result,
	});
});

export const MCQAnswerController = {
	createMCQAnswer,
};
