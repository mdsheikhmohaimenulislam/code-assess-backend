
import httpStatus from "http-status";

import {
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";

import type { Prisma } from "../../../generated/prisma/client.js";

import config from "../../config/index.js";
import { getBkashIdToken } from "../../lib/bkash.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

type BkashResponse = {
  paymentID?: string;
  bkashURL?: string;
  trxID?: string;
  transactionStatus?: string;
  statusCode?: string;
  statusMessage?: string;
  amount?: string;
  currency?: string;
  [key: string]: unknown;
};

const getBkashHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: token,
  "X-APP-Key": config.bkash_app_key,
});

const readBkashResponse = async (
  response: Response,
): Promise<BkashResponse> => {
  try {
    return (await response.json()) as BkashResponse;
  } catch {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Invalid response from bKash",
    );
  }
};

// =============================================
// CREATE PAYMENT
// =============================================

const createPayment = async (
  userId: string,
  problemId: string,
) => {
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!problemId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem ID is required",
    );
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: {
      id: true,
      isPaid: true,
      price: true,
    },
  });

  if (!problem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem not found",
    );
  }

  if (!problem.isPaid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This problem is free",
    );
  }

  if (
    problem.price === null ||
    !Number.isFinite(Number(problem.price)) ||
    Number(problem.price) <= 0
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid problem price",
    );
  }

  const paidPayment = await prisma.payment.findFirst({
    where: {
      userId,
      problemId,
      status: PaymentStatus.PAID,
    },
    select: { id: true },
  });

  if (paidPayment) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already paid for this problem",
    );
  }

  const token = await getBkashIdToken();

  const merchantInvoiceNumber =
    `PROBLEM-${Date.now()}-${crypto.randomUUID()}`;

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",
      headers: getBkashHeaders(token),
      body: JSON.stringify({
        mode: "0011",
        payerReference: userId,
        callbackURL: config.bkash_callback_url,
        amount: Number(problem.price).toFixed(2),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber,
      }),
    },
  );

  const data = await readBkashResponse(response);

  if (
    !response.ok ||
    data.statusCode !== "0000" ||
    !data.paymentID ||
    !data.bkashURL
  ) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      data.statusMessage ||
        "Failed to create bKash checkout",
    );
  }

  // Save a new record for this checkout attempt.
  const payment = await prisma.payment.create({
    data: {
      user: {
        connect: { id: userId },
      },
      problem: {
        connect: { id: problemId },
      },
      amount: problem.price,
      currency: "BDT",
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.BKASH,
      merchantInvoiceNumber,
      payerReference: userId,
      bkashPaymentId: data.paymentID,
      gatewayResponse: data as Prisma.InputJsonValue,
    },
  });

  return {
    paymentId: payment.id,
    problemId: payment.problemId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    bkashPaymentId: data.paymentID,
    bkashURL: data.bkashURL,
  };
};

// =============================================
// VERIFY / EXECUTE PAYMENT
// =============================================

const verifyAndUpdatePayment = async (
  bkashPaymentId: string,
  userId?: string,
) => {
  if (!bkashPaymentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "bKash payment ID is required",
    );
  }

  const payment = await prisma.payment.findFirst({
    where: {
      bkashPaymentId,
      ...(userId ? { userId } : {}),
    },
  });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found",
    );
  }

  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  if (payment.status !== PaymentStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment is no longer pending",
    );
  }

  const token = await getBkashIdToken();

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/execute`,
    {
      method: "POST",
      headers: getBkashHeaders(token),
      body: JSON.stringify({
        paymentID: payment.bkashPaymentId,
      }),
    },
  );

  const data = await readBkashResponse(response);

  if (!response.ok) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      data.statusMessage ||
        "Failed to verify bKash payment",
    );
  }

  // Never mark the payment PAID unless bKash confirms completion.
  if (
    data.statusCode !== "0000" ||
    data.transactionStatus !== "Completed" ||
    !data.trxID
  ) {
    // It may still be processing. Keep the record PENDING
    // until the gateway confirms its final state.
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      data.statusMessage ||
        "bKash has not confirmed payment completion",
    );
  }

  // Check the amount returned by bKash when available.
  if (
    data.amount !== undefined &&
    Number(data.amount) !== Number(payment.amount)
  ) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Payment amount does not match",
    );
  }

  // Persist the confirmed successful transaction.
  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.PAID,
      bkashTrxId: data.trxID,
      paidAt: new Date(),
      gatewayResponse: data as Prisma.InputJsonValue,
    },
  });
};

// Called by an authenticated user using our database payment ID.
const executePayment = async (
  userId: string,
  paymentId: string,
) => {
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!paymentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment ID is required",
    );
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      userId,
    },
    select: {
      bkashPaymentId: true,
    },
  });

  if (!payment?.bkashPaymentId) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found",
    );
  }

  return verifyAndUpdatePayment(
    payment.bkashPaymentId,
    userId,
  );
};

// Called after the bKash callback identifies a payment.
// The callback itself must be validated by the controller.
const executePaymentByBkashId = async (
  bkashPaymentId: string,
) => {
  return verifyAndUpdatePayment(bkashPaymentId);
};

// These are for trusted, validated callback handling only.
// Do not call them just because a browser sends a status.
const markPaymentFailed = async (
  bkashPaymentId: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { bkashPaymentId },
    select: { id: true, status: true },
  });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found",
    );
  }

  if (payment.status !== PaymentStatus.PENDING) {
    return payment;
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });
};

const markPaymentCancelled = async (
  bkashPaymentId: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { bkashPaymentId },
    select: { id: true, status: true },
  });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found",
    );
  }

  if (payment.status !== PaymentStatus.PENDING) {
    return payment;
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.CANCELLED },
  });
};






const getAllPayments = async (
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        problem: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    }),
    prisma.payment.count(),
  ]);

  return {
    data: payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};



export const PaymentService = {
  createPayment,
  executePayment,
  executePaymentByBkashId,
  markPaymentFailed,
  markPaymentCancelled,
  getAllPayments
};
