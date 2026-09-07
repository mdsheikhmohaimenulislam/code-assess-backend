import { AssessmentStatus, Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateAssessmentProblemPayload, UpdateAssessmentProblemPayload } from "./assessmentProblem.interface.js";
import httpStatus from 'http-status';





const createAssessmentProblem = async (
  userId: string,
  userRole: Role,
  assessmentId: string,
  payload: CreateAssessmentProblemPayload,
) => {
  const { problemId, marks, order } = payload;

  // Validate user
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  // Validate assessment ID
  if (!assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment ID is required",
    );
  }

  // Validate problem ID
  if (!problemId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem ID is required",
    );
  }

  // Validate marks
  if (marks <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Marks must be greater than 0",
    );
  }

  // Validate order
  if (order <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order must be greater than 0",
    );
  }

  // Find assessment
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
    select: {
      id: true,
      status: true,
      createdById: true,
      company: {
        select: {
          userId: true,
        },
      },
    },
  });

  // Assessment not found
  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  // COMPANY can manage only own assessment
  if (
    userRole === Role.COMPANY &&
    assessment.company.userId !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to manage this assessment",
    );
  }

  // Only DRAFT assessment can be modified
  if (assessment.status !== AssessmentStatus.DRAFT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problems can only be added to a draft assessment",
    );
  }

  // Find problem
  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
    select: {
      id: true,
      title: true,
      type: true,
      difficulty: true,
      category: true,
    },
  });

  // Problem not found
  if (!problem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem not found",
    );
  }

  // Check duplicate problem
  const existingProblem =
    await prisma.assessmentProblem.findUnique({
      where: {
        assessmentId_problemId: {
          assessmentId,
          problemId,
        },
      },
      select: {
        id: true,
      },
    });

  if (existingProblem) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This problem is already added to the assessment",
    );
  }

  // Check duplicate order
  const existingOrder =
    await prisma.assessmentProblem.findUnique({
      where: {
        assessmentId_order: {
          assessmentId,
          order,
        },
      },
      select: {
        id: true,
      },
    });

  if (existingOrder) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Order ${order} is already used in this assessment`,
    );
  }

  // Create AssessmentProblem + update total marks
  const result = await prisma.$transaction(async (tx) => {
    const assessmentProblem =
      await tx.assessmentProblem.create({
        data: {
          assessmentId,
          problemId,
          marks,
          order,
        },
        select: {
          id: true,
          assessmentId: true,
          problemId: true,
          marks: true,
          order: true,
          problem: {
            select: {
              id: true,
              title: true,
              type: true,
              difficulty: true,
              category: true,
            },
          },
        },
      });

    // Calculate total marks
    const marksResult =
      await tx.assessmentProblem.aggregate({
        where: {
          assessmentId,
        },
        _sum: {
          marks: true,
        },
      });

    const totalMarks = marksResult._sum.marks ?? 0;

    // Update assessment total marks
    await tx.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        totalMarks,
      },
    });

    return assessmentProblem;
  });

  return result;
};


const getAssessmentProblems = async (
  assessmentId: string,
) => {
  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      select: {
        id: true,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  const result =
    await prisma.assessmentProblem.findMany({
      where: {
        assessmentId,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        assessmentId: true,
        problemId: true,
        marks: true,
        order: true,

        problem: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            difficulty: true,
            category: true,
            inputFormat: true,
            outputFormat: true,
            constraints: true,
            timeLimit: true,
            memoryLimit: true,
          },
        },
      },
    });

  return result;
};


const getAssessmentProblemById = async (
  id: string,
) => {
  const result =
    await prisma.assessmentProblem.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        assessmentId: true,
        problemId: true,
        marks: true,
        order: true,
        createdAt: true,

        assessment: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },

        problem: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            difficulty: true,
            category: true,
            inputFormat: true,
            outputFormat: true,
            constraints: true,
            timeLimit: true,
            memoryLimit: true,
          },
        },
      },
    });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment problem not found",
    );
  }

  return result;
};


const updateAssessmentProblem = async (
  userId: string,
  userRole: Role,
  id: string,
  payload: UpdateAssessmentProblemPayload,
) => {
  const { marks, order } = payload;

  // Check authentication
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  // Check assessment problem ID
  if (!id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment problem ID is required",
    );
  }

  // Find assessment problem
  const assessmentProblem =
    await prisma.assessmentProblem.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        assessmentId: true,
        problemId: true,
        marks: true,
        order: true,

        assessment: {
          select: {
            id: true,
            status: true,
            createdById: true,

            company: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

  if (!assessmentProblem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment problem not found",
    );
  }

  const assessment = assessmentProblem.assessment;

  // Check ownership
  if (
    userRole === Role.COMPANY &&
    assessment.company.userId !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to manage this assessment",
    );
  }

  // Only draft assessment can be updated
  if (
    assessment.status !== AssessmentStatus.DRAFT
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problems can only be updated in a draft assessment",
    );
  }

  // Check duplicate order
  if (
    order !== undefined &&
    order !== assessmentProblem.order
  ) {
    const existingOrder =
      await prisma.assessmentProblem.findUnique({
        where: {
          assessmentId_order: {
            assessmentId: assessmentProblem.assessmentId,
            order,
          },
        },
        select: {
          id: true,
        },
      });

    if (
      existingOrder &&
      existingOrder.id !== assessmentProblem.id
    ) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Order ${order} is already used in this assessment`,
      );
    }
  }

  // Update + recalculate total marks
  const result = await prisma.$transaction(
    async (tx) => {
      const updated =
        await tx.assessmentProblem.update({
          where: {
            id: assessmentProblem.id,
          },

          data: {
            ...(marks !== undefined && {
              marks,
            }),

            ...(order !== undefined && {
              order,
            }),
          },

          select: {
            id: true,
            assessmentId: true,
            problemId: true,
            marks: true,
            order: true,
            createdAt: true,

            problem: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                difficulty: true,
                category: true,
              },
            },
          },
        });

      // Recalculate total marks
      const marksResult =
        await tx.assessmentProblem.aggregate({
          where: {
            assessmentId:
              assessmentProblem.assessmentId,
          },

          _sum: {
            marks: true,
          },
        });

      const totalMarks =
        marksResult._sum.marks ?? 0;

      await tx.assessment.update({
        where: {
          id: assessmentProblem.assessmentId,
        },

        data: {
          totalMarks,
        },
      });

      return updated;
    },
  );

  return result;
};


const deleteAssessmentProblem = async (
  userId: string,
  userRole: Role,
  id: string,
) => {
  // Check authentication
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  // Check assessment problem ID
  if (!id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment problem ID is required",
    );
  }

  // Find assessment problem
  const assessmentProblem =
    await prisma.assessmentProblem.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        assessmentId: true,
        problemId: true,
        marks: true,
        order: true,

        assessment: {
          select: {
            id: true,
            status: true,
            createdById: true,

            company: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

  if (!assessmentProblem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment problem not found",
    );
  }

  const assessment = assessmentProblem.assessment;

  // Check ownership
  if (
    userRole === Role.COMPANY &&
    assessment.company.userId !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to manage this assessment",
    );
  }

  // Only draft assessment can be updated
  if (
    assessment.status !== AssessmentStatus.DRAFT
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problems can only be deleted from a draft assessment",
    );
  }

  // Delete + recalculate total marks
  const result = await prisma.$transaction(
    async (tx) => {
      // Delete assessment problem
      const deleted =
        await tx.assessmentProblem.delete({
          where: {
            id: assessmentProblem.id,
          },
          select: {
            id: true,
            assessmentId: true,
            problemId: true,
            marks: true,
            order: true,
          },
        });

      // Recalculate total marks
      const marksResult =
        await tx.assessmentProblem.aggregate({
          where: {
            assessmentId:
              assessmentProblem.assessmentId,
          },
          _sum: {
            marks: true,
          },
        });

      const totalMarks =
        marksResult._sum.marks ?? 0;

      // Update assessment total marks
      await tx.assessment.update({
        where: {
          id: assessmentProblem.assessmentId,
        },
        data: {
          totalMarks,
        },
      });

      return deleted;
    },
  );

  return result;
};




export const AssessmentProblemService = {
  createAssessmentProblem,
  getAssessmentProblems,
  getAssessmentProblemById,
  updateAssessmentProblem,
deleteAssessmentProblem
};