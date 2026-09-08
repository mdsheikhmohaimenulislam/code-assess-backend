import {
	AssessmentAccessType,
	AttemptStatus,
	PaymentStatus,
	ProblemType,
	ProgrammingLanguage,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";

const createAnswer = async (
  userId: string,
  attemptId: string,
  problemId: string,
  answer: string,
  language: ProgrammingLanguage,
) => {
  // --------------------------------
  // 1. Find candidate profile
  // --------------------------------

  const candidate = await prisma.candidateProfile.findUnique({
	where: {
	  userId,
	},
	select: {
	  id: true,
	},
  });

  if (!candidate) {
	throw new AppError(
	  httpStatus.NOT_FOUND,
	  "Candidate profile not found",
	);
  }

  // --------------------------------
  // 2. Find attempt + assessment
  // --------------------------------

  const attempt = await prisma.attempt.findUnique({
	where: {
	  id: attemptId,
	},
	select: {
	  id: true,
	  assessmentId: true,
	  candidateId: true,
	  status: true,
	  expiresAt: true,

	  assessment: {
		select: {
		  id: true,
		  title: true,
		  accessType: true,
		  price: true,
		},
	  },
	},
  });

  if (!attempt) {
	throw new AppError(
	  httpStatus.NOT_FOUND,
	  "Attempt not found",
	);
  }

  // --------------------------------
  // 3. Check attempt ownership
  // --------------------------------

  if (attempt.candidateId !== candidate.id) {
	throw new AppError(
	  httpStatus.FORBIDDEN,
	  "You are not allowed to answer this attempt",
	);
  }

  // --------------------------------
  // 4. Check attempt status
  // --------------------------------

  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
	throw new AppError(
	  httpStatus.BAD_REQUEST,
	  "Attempt is not active",
	);
  }

  // --------------------------------
  // 5. Check attempt expiry
  // --------------------------------

  if (attempt.expiresAt && new Date() >= attempt.expiresAt) {
	await prisma.attempt.update({
	  where: {
		id: attemptId,
	  },
	  data: {
		status: AttemptStatus.EXPIRED,
	  },
	});

	throw new AppError(
	  httpStatus.BAD_REQUEST,
	  "Attempt time has expired",
	);
  }

  // --------------------------------
  // 6. Check assessment payment
  // --------------------------------

  if (attempt.assessment.accessType === AssessmentAccessType.PAID) {
	const payment = await prisma.payment.findFirst({
	  where: {
		userId,
		assessmentId: attempt.assessmentId,
		status: PaymentStatus.PAID,
	  },
	  select: {
		id: true,
		status: true,
		paymentMethod: true,
	  },
	});

	if (!payment) {
	  throw new AppError(
		httpStatus.PAYMENT_REQUIRED,
		"This assessment is paid. Please complete the payment before answering.",
	  );
	}
  }

  // --------------------------------
  // 7. Find problem
  // --------------------------------

  const problem = await prisma.problem.findUnique({
	where: {
	  id: problemId,
	},
	select: {
	  id: true,
	  type: true,
	},
  });

  if (!problem) {
	throw new AppError(
	  httpStatus.NOT_FOUND,
	  "Problem not found",
	);
  }

  // --------------------------------
  // 8. Only coding problems
  // --------------------------------

  if (problem.type !== ProblemType.CODING) {
	throw new AppError(
	  httpStatus.BAD_REQUEST,
	  "This endpoint is only for coding problems",
	);
  }

  // --------------------------------
  // 9. Check problem belongs to assessment
  // --------------------------------

  const assessmentProblem =
	await prisma.assessmentProblem.findUnique({
	  where: {
		assessmentId_problemId: {
		  assessmentId: attempt.assessmentId,
		  problemId,
		},
	  },
	  select: {
		id: true,
	  },
	});

  if (!assessmentProblem) {
	throw new AppError(
	  httpStatus.BAD_REQUEST,
	  "Problem does not belong to this assessment",
	);
  }

  // --------------------------------
  // 10. Validate answer
  // --------------------------------

  const cleanedAnswer = answer.trim();

  if (!cleanedAnswer) {
	throw new AppError(
	  httpStatus.BAD_REQUEST,
	  "Answer cannot be empty",
	);
  }

  // --------------------------------
  // 11. Save / Update Answer
  // --------------------------------

  const result = await prisma.answer.upsert({
	where: {
	  attemptId_problemId: {
		attemptId,
		problemId,
	  },
	},

	create: {
	  attemptId,
	  problemId,
	  answer: cleanedAnswer,
	  language,
	},

	update: {
	  answer: cleanedAnswer,
	  language,

	  // Candidate code change করলে
	  // previous evaluation reset হবে
	  marks: null,
	  isCorrect: null,
	},

	select: {
	  id: true,
	  attemptId: true,
	  problemId: true,
	  answer: true,
	  language: true,
	  marks: true,
	  isCorrect: true,
	  createdAt: true,
	  updatedAt: true,
	},
  });

  return result;
};

// const getAnswers = async (
//   userId: string,
//   userRole: string,
//   attemptId: string
// ) => {
//   const attempt = await prisma.attempt.findUnique({
//     where: { id: attemptId },
//     include: {
//       candidate: true,
//     },
//   });

//   if (!attempt) {
//     throw new Error("Attempt not found");
//   }

//   if (
//     userRole === "CANDIDATE" &&
//     attempt.candidate.userId !== userId
//   ) {
//     throw new Error("You are not allowed to view these answers");
//   }

//   return prisma.answer.findMany({
//     where: { attemptId },
//     include: {
//       problem: true,
//     },
//   });
// };

// const getAnswerById = async (
//   userId: string,
//   userRole: string,
//   id: string
// ) => {
//   const answer = await prisma.answer.findUnique({
//     where: { id },
//     include: {
//       attempt: {
//         include: {
//           candidate: true,
//         },
//       },
//       problem: true,
//     },
//   });

//   if (!answer) {
//     throw new Error("Answer not found");
//   }

//   if (
//     userRole === "CANDIDATE" &&
//     answer.attempt.candidate.userId !== userId
//   ) {
//     throw new Error("You are not allowed to view this answer");
//   }

//   return answer;
// };

// const updateAnswer = async (
//   userId: string,
//   id: string,
//   answer: string
// ) => {
//   const existing = await prisma.answer.findUnique({
//     where: { id },
//     include: {
//       attempt: {
//         include: {
//           candidate: true,
//         },
//       },
//     },
//   });

//   if (!existing) {
//     throw new Error("Answer not found");
//   }

//   if (existing.attempt.candidate.userId !== userId) {
//     throw new Error("You are not allowed to update this answer");
//   }

//   if (existing.attempt.status !== AttemptStatus.IN_PROGRESS) {
//     throw new Error("Attempt is not active");
//   }

//   return prisma.answer.update({
//     where: { id },
//     data: { answer },
//   });
// };

export const AnswerService = {
	createAnswer,
	//   getAnswers,
	//   getAnswerById,
	//   updateAnswer,
};
