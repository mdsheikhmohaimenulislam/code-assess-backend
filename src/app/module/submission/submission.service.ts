import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

interface IUpdateSubmissionPayload {
  obtainedMark?: number;
  status?: "PENDING" | "EVALUATED" | "FAILED";
  isCorrect?: boolean | null;
}

// Get all submissions
const getAllSubmissions = async () => {
  return prisma.problemSubmission.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          marks: true,
        },
      },
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

// Get single submission
const getSubmissionById = async (id: string) => {
  const submission = await prisma.problemSubmission.findUnique({
    where: { id },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          marks: true,
        },
      },
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!submission) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Submission not found",
    );
  }

  return submission;
};






// Get logged-in candidate's submissions
const getMySubmissions = async (userId: string) => {
  return prisma.problemSubmission.findMany({
    where: {
      candidateId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          marks: true,
        },
      },
    },
  });
};

// Update submission
const updateSubmission = async (
  id: string,
  payload: IUpdateSubmissionPayload,
) => {
  const existingSubmission =
    await prisma.problemSubmission.findUnique({
      where: { id },
      include: {
        problem: {
          select: {
            marks: true,
          },
        },
      },
    });

  if (!existingSubmission) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Submission not found",
    );
  }

  if (
    payload.obtainedMark !== undefined &&
    payload.obtainedMark > existingSubmission.problem.marks
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Obtained mark cannot exceed ${existingSubmission.problem.marks}`,
    );
  }

  const updatedSubmission =
    await prisma.problemSubmission.update({
      where: { id },
      data: {
        ...(payload.obtainedMark !== undefined && {
          obtainedMark: payload.obtainedMark,
        }),
        ...(payload.status !== undefined && {
          status: payload.status,
        }),
        ...(payload.isCorrect !== undefined && {
          isCorrect: payload.isCorrect,
        }),
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            marks: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  return updatedSubmission;
};

export const SubmissionService = {
  getAllSubmissions,
  getSubmissionById,
  getMySubmissions,
  updateSubmission,
};