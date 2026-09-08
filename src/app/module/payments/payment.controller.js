import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { PaymentService } from "./payment.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
const createPayment = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const { assessmentId } = req.params;
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	if (!assessmentId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
	}
	const result = await PaymentService.createPayment(userId, assessmentId);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Payment created successfully",
		data: result,
	});
});
const executePayment = catchAsync(async (req, res) => {
	const { id } = req.params;
	if (!id) {
		throw new AppError(httpStatus.BAD_REQUEST, "Payment ID is required");
	}
	const result = await PaymentService.executePayment(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment executed successfully",
		data: result,
	});
});
export const PaymentController = {
	createPayment,
	executePayment,
};
//# sourceMappingURL=payment.controller.js.map
