import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

interface ISubmitAnswerPayload {
  problemId: string;
  language: "javascript" | "typescript" | "python" | "java" | "cpp";
  code: string;
  startedAt: Date;
  submittedAt: Date;
}

const submitAnswer = async (
  userId: string,
  payload: ISubmitAnswerPayload,
) => {
  if (
    !payload?.problemId ||
    !payload?.language ||
    !payload?.code?.trim() ||
    !payload?.startedAt ||
    !payload?.submittedAt
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem ID, language, code, start time and submission time are required",
    );
  }

  const problem = await prisma.problem.findUnique({
    where: {
      id: payload.problemId,
    },
    select: {
      id: true,
    },
  });

  if (!problem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem not found",
    );
  }

const submission = await prisma.problemSubmission.create({
  data: {
    candidateId: userId,
    problemId: problem.id,
    language: payload.language,
    code: payload.code.trim(),
    answer: payload.code.trim(),
    startedAt: payload.startedAt,
    submittedAt: payload.submittedAt,
    obtainedMark: 0,
    isCorrect: null,
    status: "PENDING",
  },
});

  return submission;
};

export const AnswerService = {
  submitAnswer,
};