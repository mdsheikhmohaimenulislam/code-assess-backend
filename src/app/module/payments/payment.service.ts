// import httpStatus from "http-status";

// import {
// 	PaymentMethod,
// 	PaymentStatus,
// } from "../../../generated/prisma/enums.js";

// import type { Prisma } from "../../../generated/prisma/client.js";

// import config from "../../config/index.js";
// import { getBkashIdToken } from "../../lib/bkash.js";
// import { prisma } from "../../lib/prisma.js";
// import { AppError } from "../../utils/AppError.js";

// // ======================================================
// // CREATE PAYMENT
// // ======================================================

// const createPayment = async (userId: string, assessmentId: string) => {
// 	if (!userId) {
// 		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
// 	}

// 	if (!assessmentId) {
// 		throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
// 	}

// 	// Check assessment
// 	const assessment = await prisma.assessment.findUnique({
// 		where: {
// 			id: assessmentId,
// 		},
// 		select: {
// 			id: true,
// 			title: true,
// 			accessType: true,
// 			price: true,
// 			status: true,
// 		},
// 	});

// 	if (!assessment) {
// 		throw new AppError(httpStatus.NOT_FOUND, "Assessment not found");
// 	}

// 	// Assessment must be PAID
// 	if (assessment.accessType !== "PAID") {
// 		throw new AppError(
// 			httpStatus.BAD_REQUEST,
// 			"This assessment does not require payment",
// 		);
// 	}

// 	// Check price
// 	if (assessment.price === null || Number(assessment.price) <= 0) {
// 		throw new AppError(httpStatus.BAD_REQUEST, "Invalid assessment price");
// 	}

// 	// Check previous payment
// 	const existingPayment = await prisma.payment.findFirst({
// 		where: {
// 			userId,
// 			assessmentId,
// 		},
// 		orderBy: {
// 			createdAt: "desc",
// 		},
// 	});

// 	if (existingPayment?.status === PaymentStatus.PAID) {
// 		throw new AppError(
// 			httpStatus.CONFLICT,
// 			"This assessment has already been paid",
// 		);
// 	}

// 	// Get bKash token
// 	const idToken = await getBkashIdToken();

// 	// Generate merchant invoice number
// 	const merchantInvoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

// 	// Create bKash payment
// 	const response = await fetch(
// 		`${config.bkash_base_url}/tokenized/checkout/create`,
// 		{
// 			method: "POST",

// 			headers: {
// 				"Content-Type": "application/json",
// 				Accept: "application/json",
// 				Authorization: idToken,
// 				"X-APP-Key": config.bkash_app_key,
// 			},

// 			body: JSON.stringify({
// 				mode: "0011",
// 				payerReference: userId,
// 				callbackURL: config.bkash_callback_url,
// 				amount: Number(assessment.price).toFixed(2),
// 				currency: "BDT",
// 				intent: "sale",
// 				merchantInvoiceNumber,
// 			}),
// 		},
// 	);

// 	const result: {
// 		paymentID?: string;
// 		bkashURL?: string;
// 		statusCode?: string;
// 		statusMessage?: string;
// 		[key: string]: unknown;
// 	} = await response.json();

// 	if (!response.ok) {
// 		throw new AppError(httpStatus.BAD_GATEWAY, "bKash payment creation failed");
// 	}

// 	if (result.statusCode !== "0000") {
// 		throw new AppError(
// 			httpStatus.BAD_GATEWAY,
// 			result.statusMessage || "bKash payment creation failed",
// 		);
// 	}

// 	if (!result.paymentID) {
// 		throw new AppError(httpStatus.BAD_GATEWAY, "bKash payment ID not received");
// 	}

// 	// Save payment
// 	let payment;

// 	if (existingPayment) {
// 		payment = await prisma.payment.update({
// 			where: {
// 				id: existingPayment.id,
// 			},

// 			data: {
// 				amount: assessment.price,
// 				currency: "BDT",
// 				status: PaymentStatus.PENDING,
// 				paymentMethod: PaymentMethod.BKASH,
// 				merchantInvoiceNumber,
// 				bkashPaymentId: result.paymentID,
// 				payerReference: userId,
// 				gatewayResponse: result as Prisma.InputJsonValue,
// 			},
// 		});
// 	} else {
// 		payment = await prisma.payment.create({
// 			data: {
// 				userId,
// 				assessmentId,
// 				amount: assessment.price,
// 				currency: "BDT",
// 				status: PaymentStatus.PENDING,
// 				paymentMethod: PaymentMethod.BKASH,
// 				merchantInvoiceNumber,
// 				bkashPaymentId: result.paymentID,
// 				payerReference: userId,
// 				gatewayResponse: result as Prisma.InputJsonValue,
// 			},
// 		});
// 	}

// 	return {
// 		id: payment.id,
// 		assessmentId: payment.assessmentId,
// 		amount: payment.amount,
// 		currency: payment.currency,
// 		status: payment.status,
// 		paymentMethod: payment.paymentMethod,
// 		merchantInvoiceNumber: payment.merchantInvoiceNumber,
// 		bkashPaymentId: payment.bkashPaymentId,
// 		bkashURL: result.bkashURL,
// 	};
// };

// // ======================================================
// // EXECUTE PAYMENT
// // ======================================================

// const executePayment = async (paymentID: string) => {
// 	if (!paymentID) {
// 		throw new AppError(httpStatus.BAD_REQUEST, "Payment ID is required");
// 	}

// 	// Find payment using our database Payment ID
// 	const payment = await prisma.payment.findUnique({
// 		where: {
// 			id: paymentID,
// 		},
// 	});

// 	if (!payment) {
// 		throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
// 	}

// 	// Already paid
// 	if (payment.status === PaymentStatus.PAID) {
// 		return payment;
// 	}

// 	// bKash payment ID must exist
// 	if (!payment.bkashPaymentId) {
// 		throw new AppError(httpStatus.BAD_REQUEST, "bKash Payment ID not found");
// 	}

// 	// Get bKash token
// 	const idToken = await getBkashIdToken();

// 	// Execute bKash payment
// 	const response = await fetch(
// 		`${config.bkash_base_url}/tokenized/checkout/execute`,
// 		{
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 				Accept: "application/json",
// 				Authorization: idToken,
// 				"X-APP-Key": config.bkash_app_key,
// 			},
// 			body: JSON.stringify({
// 				// IMPORTANT:
// 				// bKash expects bKash paymentID,
// 				// NOT our database Payment.id
// 				paymentID: payment.bkashPaymentId,
// 			}),
// 		},
// 	);

// 	const result: {
// 		statusCode?: string;
// 		statusMessage?: string;
// 		trxID?: string;
// 		[key: string]: unknown;
// 	} = await response.json();

// 	// bKash API error
// 	if (!response.ok) {
// 		throw new AppError(
// 			httpStatus.BAD_GATEWAY,
// 			result.statusMessage || "bKash payment execution failed",
// 		);
// 	}

// 	// ==============================
// 	// PAYMENT SUCCESS
// 	// ==============================

// 	if (result.statusCode === "0000") {
// 		if (!result.trxID) {
// 			throw new AppError(
// 				httpStatus.BAD_GATEWAY,
// 				"bKash transaction ID not received",
// 			);
// 		}

// 		const updatedPayment = await prisma.payment.update({
// 			where: {
// 				id: payment.id,
// 			},
// 			data: {
// 				status: PaymentStatus.PAID,
// 				bkashTrxId: result.trxID,
// 				paidAt: new Date(),
// 				gatewayResponse: result as Prisma.InputJsonValue,
// 			},
// 		});

// 		return updatedPayment;
// 	}

// 	// ==============================
// 	// PAYMENT FAILED
// 	// ==============================

// 	await prisma.payment.update({
// 		where: {
// 			id: payment.id,
// 		},
// 		data: {
// 			status: PaymentStatus.FAILED,
// 			gatewayResponse: result as Prisma.InputJsonValue,
// 		},
// 	});

// 	throw new AppError(
// 		httpStatus.BAD_GATEWAY,
// 		result.statusMessage || "bKash payment failed",
// 	);
// };


// const executePaymentByBkashId = async (
//   bkashPaymentId: string,
// ) => {
//   if (!bkashPaymentId) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "bKash Payment ID is required",
//     );
//   }

//   // Find our payment using bKash payment ID
//   const payment = await prisma.payment.findUnique({
//     where: {
//       bkashPaymentId,
//     },
//   });

//   if (!payment) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Payment not found",
//     );
//   }

//   // Already paid
//   if (payment.status === PaymentStatus.PAID) {
//     return payment;
//   }

//   // Get bKash token
//   const idToken = await getBkashIdToken();

//   // Execute bKash payment
//   const response = await fetch(
//     `${config.bkash_base_url}/tokenized/checkout/execute`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         Authorization: idToken,
//         "X-APP-Key": config.bkash_app_key,
//       },
//       body: JSON.stringify({
//         paymentID: payment.bkashPaymentId,
//       }),
//     },
//   );

//   const result: {
//     statusCode?: string;
//     statusMessage?: string;
//     trxID?: string;
//     [key: string]: unknown;
//   } = await response.json();

//   // bKash API error
//   if (!response.ok) {
//     throw new AppError(
//       httpStatus.BAD_GATEWAY,
//       result.statusMessage ||
//         "bKash payment execution failed",
//     );
//   }

//   // ==============================
//   // SUCCESS
//   // ==============================

//   if (result.statusCode === "0000") {
//     if (!result.trxID) {
//       throw new AppError(
//         httpStatus.BAD_GATEWAY,
//         "bKash transaction ID not received",
//       );
//     }

//     const updatedPayment =
//       await prisma.payment.update({
//         where: {
//           id: payment.id,
//         },
//         data: {
//           status: PaymentStatus.PAID,
//           bkashTrxId: result.trxID,
//           paidAt: new Date(),
//           gatewayResponse:
//             result as Prisma.InputJsonValue,
//         },
//       });

//     return updatedPayment;
//   }

//   // ==============================
//   // FAILED
//   // ==============================

//   await prisma.payment.update({
//     where: {
//       id: payment.id,
//     },
//     data: {
//       status: PaymentStatus.FAILED,
//       gatewayResponse:
//         result as Prisma.InputJsonValue,
//     },
//   });

//   throw new AppError(
//     httpStatus.BAD_GATEWAY,
//     result.statusMessage ||
//       "bKash payment failed",
//   );
// };

// export const PaymentService = {
// 	createPayment,
// 	executePayment,
// 	executePaymentByBkashId
// };



import httpStatus from "http-status";

import {
  AssessmentStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";

import type { Prisma } from "../../../generated/prisma/client.js";

import config from "../../config/index.js";
import { getBkashIdToken } from "../../lib/bkash.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";


const createPayment = async (
  userId: string,
  problemId: string,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!problemId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem ID is required",
    );
  }

  // -----------------------------------------
  // Find problem
  // -----------------------------------------

  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
    select: {
      id: true,
      title: true,
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

  // -----------------------------------------
  // Check problem access type
  // -----------------------------------------

  if (!problem.isPaid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This problem is free",
    );
  }

  // -----------------------------------------
  // Check price
  // -----------------------------------------

  if (
    problem.price === null ||
    Number(problem.price) <= 0
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid problem price",
    );
  }

  // -----------------------------------------
  // Check existing paid payment
  // -----------------------------------------

  const existingPaidPayment =
    await prisma.payment.findFirst({
      where: {
        userId,
        problemId,
        status: PaymentStatus.PAID,
      },
    });

  if (existingPaidPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already paid for this problem",
    );
  }

  // -----------------------------------------
  // Check existing pending payment
  // -----------------------------------------

  const existingPendingPayment =
    await prisma.payment.findFirst({
      where: {
        userId,
        problemId,
        status: PaymentStatus.PENDING,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (existingPendingPayment?.bkashPaymentId) {
    return {
      paymentId: existingPendingPayment.id,
      bkashPaymentId:
        existingPendingPayment.bkashPaymentId,

      bkashURL: existingPendingPayment.gatewayResponse
        ? (
            existingPendingPayment.gatewayResponse as {
              bkashURL?: string;
            }
          ).bkashURL
        : undefined,
    };
  }

  // -----------------------------------------
  // Get bKash token
  // -----------------------------------------

  const token = await getBkashIdToken();

  // -----------------------------------------
  // Merchant invoice number
  // -----------------------------------------

  const merchantInvoiceNumber = `PROBLEM-${Date.now()}-${Math.floor(
    Math.random() * 100000,
  )}`;

  // -----------------------------------------
  // Create bKash payment
  // --------
  // ---------------------------------


console.log(
  "BKASH CALLBACK URL:",
  config.bkash_callback_url,
);

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
        "X-App-Key": config.bkash_app_key,
      },

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

  const data = (await response.json()) as {
    paymentID?: string;
    bkashURL?: string;
    statusCode?: string;
    statusMessage?: string;
  };

  if (!response.ok || !data.paymentID) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      data.statusMessage ||
        "Failed to create bKash payment",
    );
  }

  // -----------------------------------------
  // Save payment
  // -----------------------------------------

const payment = await prisma.payment.create({
  data: {
    user: {
      connect: {
        id: userId,
      },
    },
    problem: {
      connect: {
        id: problemId,
      },
    },
    amount: problem.price,
    currency: "BDT",
    status: "PENDING",
    paymentMethod: "BKASH",
    merchantInvoiceNumber,
    payerReference:userId,
    bkashPaymentId: data.paymentID,
    gatewayResponse: data as Prisma.InputJsonValue,
  },
});

  return {
    paymentId: payment.id,
    bkashPaymentId: data.paymentID,
    bkashURL: data.bkashURL,
  };
};


const executePayment = async (
  userId: string,
  paymentID: string,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!paymentID) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment ID is required",
    );
  }

  // -----------------------------------------
  // Find payment owned by current user
  // -----------------------------------------

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentID,
      userId,
    },
  });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found",
    );
  }

  if (!payment.bkashPaymentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "bKash payment ID not found",
    );
  }

  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  if (payment.status !== PaymentStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment cannot be executed",
    );
  }

  // -----------------------------------------
  // Get bKash token
  // -----------------------------------------

  const token = await getBkashIdToken();

  // -----------------------------------------
  // Execute bKash payment
  // -----------------------------------------

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        paymentID: payment.bkashPaymentId,
      }),
    },
  );

  const data = (await response.json()) as {
    paymentID?: string;
    trxID?: string;
    transactionStatus?: string;
    statusCode?: string;
    statusMessage?: string;
    amount?: string;
    currency?: string;
  };

  if (!response.ok) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      data.statusMessage ||
        "Failed to execute bKash payment",
    );
  }

  if (
    data.transactionStatus !== "Completed"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      data.statusMessage ||
        "bKash payment was not completed",
    );
  }

  // -----------------------------------------
  // Update database
  // -----------------------------------------

  const updatedPayment =
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PaymentStatus.PAID,
        bkashTrxId: data.trxID,
        paidAt: new Date(),

        gatewayResponse:
          data as Prisma.InputJsonValue,
      },
    });

  return updatedPayment;
};

const executePaymentByBkashId = async (
  bkashPaymentId: string,
) => {
  if (!bkashPaymentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "bKash payment ID is required",
    );
  }

  // -----------------------------------------
  // Find payment
  // -----------------------------------------

  const payment =
    await prisma.payment.findUnique({
      where: {
        bkashPaymentId,
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
      "Payment cannot be executed",
    );
  }

  // -----------------------------------------
  // Get bKash token
  // -----------------------------------------

  const token = await getBkashIdToken();

  // -----------------------------------------
  // Execute payment
  // -----------------------------------------

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        paymentID: bkashPaymentId,
      }),
    },
  );

  const data = (await response.json()) as {
    paymentID?: string;
    trxID?: string;
    transactionStatus?: string;
    statusCode?: string;
    statusMessage?: string;
    amount?: string;
    currency?: string;
  };

  if (!response.ok) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      data.statusMessage ||
        "Failed to execute bKash payment",
    );
  }

  if (
    data.transactionStatus !== "Completed"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      data.statusMessage ||
        "bKash payment was not completed",
    );
  }

  // -----------------------------------------
  // Update payment
  // -----------------------------------------

  const updatedPayment =
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PaymentStatus.PAID,
        bkashTrxId: data.trxID,
        paidAt: new Date(),

        gatewayResponse:
          data as Prisma.InputJsonValue,
      },
    });

  return updatedPayment;
};

const markPaymentFailed = async (
  bkashPaymentId: string,
) => {
  if (!bkashPaymentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "bKash payment ID is required",
    );
  }

  const payment =
    await prisma.payment.findUnique({
      where: {
        bkashPaymentId,
      },
      select: {
        id: true,
        status: true,
      },
    });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found",
    );
  }

  // Don't change already paid payment
  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  return prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      status: PaymentStatus.FAILED,
    },
  });
};

const markPaymentCancelled = async (
  bkashPaymentId: string,
) => {
  if (!bkashPaymentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "bKash payment ID is required",
    );
  }

  const payment =
    await prisma.payment.findUnique({
      where: {
        bkashPaymentId,
      },
      select: {
        id: true,
        status: true,
      },
    });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found",
    );
  }

  // Don't change already paid payment
  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  return prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      status: PaymentStatus.CANCELLED,
    },
  });
};




export const PaymentService = {
  createPayment,
  executePayment,
  executePaymentByBkashId,
  markPaymentFailed,
  markPaymentCancelled,
};