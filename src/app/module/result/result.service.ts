import httpStatus from "http-status";

import { AssessmentStatus } from "../../../generated/prisma/enums.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

// ============================================
// Create Result
// ============================================

const createResult = async (
  userId: string,
  assessmentId: string,
) => {
  // ============================================
  // 1. Validate IDs
  // ============================================

  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment ID is required",
    );
  }

  // ============================================
  // 2. Find assessment
  // ============================================

  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      select: {
        id: true,
        title: true,
        accessType: true,
        price: true,
        status: true,

        problems: {
          select: {
            id: true,
            marks: true,
          },
        },
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  // ============================================
  // 3. Check assessment status
  // ============================================

  if (
    assessment.status !== AssessmentStatus.ONGOING &&
    assessment.status !== AssessmentStatus.PUBLISHED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This assessment is not available",
    );
  }

  // ============================================
  // 4. Check if assessment has problems
  // ============================================

  if (assessment.problems.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This assessment has no problems",
    );
  }

  // ============================================
  // 5. Check existing result
  // ============================================

  const existingResult =
    await prisma.result.findUnique({
      where: {
        candidateId_assessmentId: {
          candidateId: userId,
          assessmentId,
        },
      },
      include: {
        resultAnswers: {
          select: {
            id: true,
            problemId: true,
            answer: true,
            obtainedMark: true,
            isCorrect: true,
          },
        },
      },
    });

  if (existingResult) {
    return existingResult;
  }

  // ============================================
  // 6. Calculate total marks
  // ============================================

  const totalMarks = assessment.problems.reduce(
    (total, problem) => {
      return total + problem.marks;
    },
    0,
  );

  // ============================================
  // 7. Create result
  // ============================================

  const result = await prisma.result.create({
    data: {
      candidateId: userId,
      assessmentId,

      totalMarks,
      obtainedMarks: 0,
      percentage: 0,
      passed: false,
    },

    select: {
      id: true,
      candidateId: true,
      assessmentId: true,
      totalMarks: true,
      obtainedMarks: true,
      percentage: true,
      passed: true,
      rank: true,
      createdAt: true,
      updatedAt: true,

      assessment: {
        select: {
          id: true,
          title: true,
          accessType: true,
          price: true,
          status: true,
        },
      },
    },
  });

  return result;
};

// ============================================
// Get Result By ID
// ============================================

const getResultById = async (
  userId: string,
  resultId: string,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!resultId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Result ID is required",
    );
  }

  // ============================================
  // Find result
  // ============================================

  const result =
    await prisma.result.findUnique({
      where: {
        id: resultId,
      },

      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            description: true,
            accessType: true,
            price: true,
            status: true,
          },
        },

        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },

        resultAnswers: {
          select: {
            id: true,
            problemId: true,
            answer: true,
            obtainedMark: true,
            isCorrect: true,

            problem: {
              select: {
                id: true,
                title: true,
                description: true,
                marks: true,
                difficulty: true,
                category: true,

                // IMPORTANT:
                // answer intentionally excluded
              },
            },
          },
        },
      },
    });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Result not found",
    );
  }

  // ============================================
  // Access control
  // ============================================

  if (result.candidateId !== userId) {
    // Check whether current user is ADMIN/COMPANY
    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          role: true,
        },
      });

    if (
      !currentUser ||
      (currentUser.role !== "ADMIN" &&
        currentUser.role !== "COMPANY")
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to view this result",
      );
    }

    // Company can only see results of own assessments
    if (currentUser.role === "COMPANY") {
      const assessment =
        await prisma.assessment.findFirst({
          where: {
            id: result.assessmentId,
            createdById: userId,
          },
          select: {
            id: true,
          },
        });

      if (!assessment) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not allowed to view this result",
        );
      }
    }
  }

  return result;
};

// ============================================
// Get My Results
// ============================================

const getMyResults = async (
  userId: string,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  const results =
    await prisma.result.findMany({
      where: {
        candidateId: userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        candidateId: true,
        assessmentId: true,
        totalMarks: true,
        obtainedMarks: true,
        percentage: true,
        passed: true,
        rank: true,
        createdAt: true,
        updatedAt: true,

        assessment: {
          select: {
            id: true,
            title: true,
            description: true,
            accessType: true,
            price: true,
            status: true,
          },
        },
      },
    });

  return results;
};

// ============================================
// Get Assessment Results
// ============================================

const getAssessmentResults = async (
  userId: string,
  assessmentId: string,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment ID is required",
    );
  }

  // ============================================
  // Find current user
  // ============================================

  const currentUser =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

  if (!currentUser) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "User not found",
    );
  }

  // ============================================
  // Company ownership
  // ============================================

  if (currentUser.role === "COMPANY") {
    const assessment =
      await prisma.assessment.findFirst({
        where: {
          id: assessmentId,
          createdById: userId,
        },
        select: {
          id: true,
        },
      });

    if (!assessment) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to view these results",
      );
    }
  }

  // ============================================
  // Check assessment
  // ============================================

  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      select: {
        id: true,
        title: true,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  // ============================================
  // Get results
  // ============================================

  const results =
    await prisma.result.findMany({
      where: {
        assessmentId,
      },

      orderBy: [
        {
          obtainedMarks: "desc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: {
        id: true,
        candidateId: true,
        assessmentId: true,
        totalMarks: true,
        obtainedMarks: true,
        percentage: true,
        passed: true,
        rank: true,
        createdAt: true,

        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

  return {
    assessment,
    results,
  };
};

export const ResultService = {
  createResult,
  getResultById,
  getMyResults,
  getAssessmentResults,
};