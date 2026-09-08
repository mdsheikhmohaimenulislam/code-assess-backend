import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";

import { PaymentService } from "./payment.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse.js";
import config from "../../config/index.js";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { assessmentId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!assessmentId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
  }

  const result = await PaymentService.createPayment(
    userId,
    assessmentId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment created successfully",
    data: result,
  });
});

const executePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment ID is required");
  }

  const result = await PaymentService.executePayment(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment executed successfully",
    data: result,
  });
});

const paymentCallback = catchAsync(async (req: Request, res: Response) => {
  const { paymentID, status } = req.query;

  if (!paymentID || typeof paymentID !== "string") {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment ID is required");
  }

  if (status === "success") {
    await PaymentService.executePaymentByBkashId(paymentID);

    return res.redirect(
      `${config.frontend_url}/payment/success?paymentID=${paymentID}`,
    );
  }

  if (status === "failure") {
    return res.redirect(
      `${config.frontend_url}/payment/fail?paymentID=${paymentID}`,
    );
  }

  if (status === "cancel") {
    return res.redirect(
      `${config.frontend_url}/payment/cancel?paymentID=${paymentID}`,
    );
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Invalid payment status");
});

export const PaymentController = {
  createPayment,
  executePayment,
  paymentCallback,
};
