
import {
  AssessmentAccessType,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
import { ISubmitAnswerPayload } from "./answer.interface.js";


const submitAnswer = async (
  userId: string,
  assessmentId: string,
  payload: ISubmitAnswerPayload,
) => {
  // 1. Find assessment
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      accessType: true,
      status: true,
    },
  });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  // 2. Check assessment status
  if (
    assessment.status !== "PUBLISHED" &&
    assessment.status !== "ONGOING"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This assessment is not available",
    );
  }

  // 3. Check payment for paid assessments
  if (assessment.accessType === AssessmentAccessType.PAID) {
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        assessmentId,
        status: PaymentStatus.PAID,
      },
      select: { id: true },
    });

    if (!payment) {
      throw new AppError(
        httpStatus.PAYMENT_REQUIRED,
        "Please complete the assessment payment first.",
      );
    }
  }

  // 4. Find problem
  const problem = await prisma.problem.findUnique({
    where: { id: payload.problemId },
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

  // 5. Verify problem belongs to assessment
  if (problem.assessmentId !== assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem does not belong to this assessment",
    );
  }

  // 6. Identify submission type
  const isCodeSubmission = typeof payload.code === "string";

  const submittedAnswer = isCodeSubmission
    ? payload.code.trim()
    : payload.answer?.trim();

  if (!submittedAnswer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Answer or code is required",
    );
  }

  if (isCodeSubmission && !payload.language) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Programming language is required",
    );
  }

  // 7. Validate submission dates
  const startedAt = payload.startedAt
    ? new Date(payload.startedAt)
    : undefined;

  const submittedAt = payload.submittedAt
    ? new Date(payload.submittedAt)
    : new Date();

  if (
    (startedAt && Number.isNaN(startedAt.getTime())) ||
    Number.isNaN(submittedAt.getTime())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid submission date",
    );
  }

  if (startedAt && startedAt > submittedAt) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Start time cannot be after submission time",
    );
  }

  // 8. Find or create result
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

  // 9. Evaluate text answers
  // Coding submissions need a sandboxed code runner.
  const isCorrect = isCodeSubmission
    ? null
    : submittedAnswer.toLowerCase() ===
      problem.answer.trim().toLowerCase();

  const obtainedMark =
    isCorrect === true ? problem.marks : 0;

  const submissionType = isCodeSubmission
    ? "CODING"
    : "TEXT";

  const status = isCodeSubmission
    ? "SUBMITTED"
    : isCorrect
      ? "ACCEPTED"
      : "WRONG_ANSWER";

  // 10. Save or update the answer
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
      answer: submittedAnswer,
      language: isCodeSubmission
        ? payload.language
        : null,
      submissionType,
      status,
      executionMessage: isCodeSubmission
        ? "Code submitted. Evaluation is pending."
        : null,
      obtainedMark,
      isCorrect,
      startedAt,
      submittedAt,
    },
    update: {
      answer: submittedAnswer,
      language: isCodeSubmission
        ? payload.language
        : null,
      submissionType,
      status,
      executionMessage: isCodeSubmission
        ? "Code submitted. Evaluation is pending."
        : null,
      obtainedMark,
      isCorrect,
      startedAt,
      submittedAt,
    },
  });

  // 11. Calculate total marks
  const resultAnswers = await prisma.resultAnswer.findMany({
    where: { resultId: result.id },
    select: { obtainedMark: true },
  });

  const marksAggregate = await prisma.problem.aggregate({
    where: { assessmentId },
    _sum: { marks: true },
  });

  const totalMarks = marksAggregate._sum.marks ?? 0;

  const obtainedMarks = resultAnswers.reduce(
    (total, item) => total + item.obtainedMark,
    0,
  );

  const percentage =
    totalMarks > 0
      ? (obtainedMarks / totalMarks) * 100
      : 0;

  const passed = percentage >= 40;

  // 12. Update result
  return prisma.result.update({
    where: { id: result.id },
    data: {
      totalMarks,
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
          language: true,
          submissionType: true,
          status: true,
          executionMessage: true,
          obtainedMark: true,
          isCorrect: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
};

export const AnswerService = {
  submitAnswer,
};
