import {
  AssessmentAccessType,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";

interface ISubmitAnswerPayload {
  problemId: string;
  answer: string;
}

const submitAnswer = async (
  userId: string,
  assessmentId: string,
  payload: ISubmitAnswerPayload,
) => {
  // --------------------------------
  // 1. Find assessment
  // --------------------------------

  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
    select: {
      id: true,
      title: true,
      accessType: true,
      price: true,
      status: true,
    },
  });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  // --------------------------------
  // 2. Check assessment status
  // --------------------------------

  if (
    assessment.status !== "PUBLISHED" &&
    assessment.status !== "ONGOING"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This assessment is not available",
    );
  }

  // --------------------------------
  // 3. Check payment for PAID assessment
  // --------------------------------

  if (
    assessment.accessType === AssessmentAccessType.PAID
  ) {
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        assessmentId,
        status: PaymentStatus.PAID,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!payment) {
      throw new AppError(
        httpStatus.PAYMENT_REQUIRED,
        "This assessment is paid. Please complete the payment before submitting an answer.",
      );
    }
  }

  // --------------------------------
  // 4. Find problem
  // --------------------------------

  const problem = await prisma.problem.findUnique({
    where: {
      id: payload.problemId,
    },
    select: {
      id: true,
      assessmentId: true,
      answer: true,
      marks: true,
    },
  });

  if (!problem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem not found",
    );
  }

  // --------------------------------
  // 5. Check problem belongs to assessment
  // --------------------------------

  if (problem.assessmentId !== assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem does not belong to this assessment",
    );
  }

  // --------------------------------
  // 6. Validate candidate answer
  // --------------------------------

  const cleanedAnswer = payload.answer.trim();

  if (!cleanedAnswer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Answer cannot be empty",
    );
  }

  // --------------------------------
  // 7. Find or create Result
  // --------------------------------

  let result = await prisma.result.findUnique({
    where: {
      candidateId_assessmentId: {
        candidateId: userId,
        assessmentId,
      },
    },
  });

  if (!result) {
    result = await prisma.result.create({
      data: {
        candidateId: userId,
        assessmentId,
        totalMarks: 0,
        obtainedMarks: 0,
        percentage: 0,
        passed: false,
      },
    });
  }

  // --------------------------------
  // 8. Evaluate answer
  // --------------------------------

  const isCorrect =
    cleanedAnswer.toLowerCase() ===
    problem.answer.trim().toLowerCase();

  const obtainedMark = isCorrect ? problem.marks : 0;

  // --------------------------------
  // 9. Save / update ResultAnswer
  // --------------------------------

  await prisma.resultAnswer.upsert({
    where: {
      resultId_problemId: {
        resultId: result.id,
        problemId: problem.id,
      },
    },

    create: {
      resultId: result.id,
      problemId: problem.id,
      answer: cleanedAnswer,
      obtainedMark,
      isCorrect,
    },

    update: {
      answer: cleanedAnswer,
      obtainedMark,
      isCorrect,
    },
  });

  // --------------------------------
  // 10. Calculate result
  // --------------------------------

  const resultAnswers = await prisma.resultAnswer.findMany({
    where: {
      resultId: result.id,
    },
    select: {
      obtainedMark: true,
    },
  });

  const totalMarks = await prisma.problem.aggregate({
    where: {
      assessmentId,
    },
    _sum: {
      marks: true,
    },
  });

  const totalAssessmentMarks =
    totalMarks._sum.marks ?? 0;

  const obtainedMarks = resultAnswers.reduce(
    (total, item) => total + item.obtainedMark,
    0,
  );

  const percentage =
    totalAssessmentMarks > 0
      ? (obtainedMarks / totalAssessmentMarks) * 100
      : 0;

  const passed = percentage >= 40;

  // --------------------------------
  // 11. Update Result
  // --------------------------------

  const updatedResult = await prisma.result.update({
    where: {
      id: result.id,
    },

    data: {
      totalMarks: totalAssessmentMarks,
      obtainedMarks,
      percentage,
      passed,
    },

    include: {
      resultAnswers: {
        select: {
          id: true,
          problemId: true,
          answer: true,
          obtainedMark: true,
          isCorrect: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return updatedResult;
};

export const AnswerService = {
  submitAnswer,
};