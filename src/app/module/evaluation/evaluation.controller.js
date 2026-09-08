import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { EvaluationService } from "./evaluation.service.js";
import { AppError } from "../../utils/AppError.js";
const evaluateSubmission = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const answerId = req.params.id;
    // console.log(answerId);
    if (!userId || !userRole) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    if (!answerId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Answer ID is required");
    }
    const result = await EvaluationService.evaluateAnswer(answerId, userId, userRole);
    res.status(httpStatus.OK).json({
        success: true,
        statusCode: httpStatus.OK,
        message: "Answer evaluated successfully",
        data: result,
    });
});
// const getEvaluationBySubmission = async (
//   req: Request,
//   res: Response
// ) => {
//   const result =
//     await EvaluationService.getEvaluationBySubmission(
//       req.user!.userId,
//       req.user!.role,
//       req.params.submissionId
//     );
//   res.status(200).json({
//     success: true,
//     message: "Evaluation retrieved successfully",
//     data: result,
//   });
// };
// const getEvaluationById = async (
//   req: Request,
//   res: Response
// ) => {
//   const result =
//     await EvaluationService.getEvaluationById(
//       req.user!.userId,
//       req.user!.role,
//       req.params.id
//     );
//   res.status(200).json({
//     success: true,
//     message: "Evaluation retrieved successfully",
//     data: result,
//   });
// };
export const EvaluationController = {
    evaluateSubmission,
    //   getEvaluationBySubmission,
    //   getEvaluationById,
};
//# sourceMappingURL=evaluation.controller.js.map