import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
import { AnswerService } from "./answer.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
const createAnswer = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const { id } = req.params;
	const { problemId, answer, language } = req.body;
	// 1. Check authentication
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	// 2. Check Attempt ID
	if (!id) {
		throw new AppError(httpStatus.BAD_REQUEST, "Attempt ID is required");
	}
	// 3. Create / Update Answer
	const result = await AnswerService.createAnswer(
		userId,
		id,
		problemId,
		answer,
		language,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Answer saved successfully",
		data: result,
	});
});
// const getAnswers = async (req: Request, res: Response) => {
//   const result = await AnswerService.getAnswers(
//     req.user!.userId,
//     req.user!.role,
//     req.params.attemptId
//   );
//   res.status(200).json({
//     success: true,
//     message: "Answers retrieved successfully",
//     data: result,
//   });
// };
// const getAnswerById = async (req: Request, res: Response) => {
//   const result = await AnswerService.getAnswerById(
//     req.user!.userId,
//     req.user!.role,
//     req.params.id
//   );
//   res.status(200).json({
//     success: true,
//     message: "Answer retrieved successfully",
//     data: result,
//   });
// };
// const updateAnswer = async (req: Request, res: Response) => {
//   const result = await AnswerService.updateAnswer(
//     req.user!.userId,
//     req.params.id,
//     req.body.answer
//   );
//   res.status(200).json({
//     success: true,
//     message: "Answer updated successfully",
//     data: result,
//   });
// };
export const AnswerController = {
	createAnswer,
	//   getAnswers,
	//   getAnswerById,
	//   updateAnswer,
};
//# sourceMappingURL=answer.controller.js.map
