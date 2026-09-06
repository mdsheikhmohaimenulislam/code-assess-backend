import { AssessmentStatus, Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateAssessmentProblemPayload } from "./assessmentProblem.interface.js";
import httpStatus from 'http-status';





const createAssessmentProblem = async (
  userId: string,
  userRole: Role,
  assessmentId: string,
  payload: CreateAssessmentProblemPayload,
) => {
  const { problemId, marks, order } = payload;

  // Check user
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  // Check assessment ID
  if (!assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment ID is required",
    );
  }

  // Find assessment
  const assessment =
    await prisma.assessment.findUnique({
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

  // Only draft assessment
  if (
    assessment.status !== AssessmentStatus.DRAFT
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problems can only be added to a draft assessment",
    );
  }

  // Check problem
  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
    select: {
      id: true,
      title: true,
    },
  });

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
    });

  if (existingOrder) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Order ${order} is already used in this assessment`,
    );
  }

  // Create assessment problem + update total marks
  const result = await prisma.$transaction(
    async (tx) => {
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

      const totalMarks =
        marksResult._sum.marks ?? 0;

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
    },
  );

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


// const updateAssessmentProblem = async (
//   userId: string,
//   userRole: Role,
//   assessmentId: string,
//   id: string,
//   payload: UpdateAssessmentProblemPayload
// ) => {
//   const { marks, order } = payload;

//   /**
//    * Check assessment + ownership
//    */
//   const assessment = await checkAssessmentOwnership(
//     assessmentId,
//     userId,
//     userRole
//   );

//   /**
//    * Assessment must be DRAFT
//    */
//   if (assessment.status !== "DRAFT") {
//     throw new ApiError(
//       400,
//       "Problems can only be updated in a draft assessment"
//     );
//   }

//   /**
//    * Find AssessmentProblem
//    */
//   const assessmentProblem =
//     await prisma.assessmentProblem.findFirst({
//       where: {
//         id,
//         assessmentId,
//       },
//     });

//   if (!assessmentProblem) {
//     throw new ApiError(
//       404,
//       "Assessment problem not found"
//     );
//   }

//   /**
//    * Check duplicate order
//    */
//   if (
//     order !== undefined &&
//     order !== assessmentProblem.order
//   ) {
//     const existingOrder =
//       await prisma.assessmentProblem.findUnique({
//         where: {
//           assessmentId_order: {
//             assessmentId,
//             order,
//           },
//         },
//       });

//     if (existingOrder) {
//       throw new ApiError(
//         409,
//         `Order ${order} is already used in this assessment`
//       );
//     }
//   }

//   /**
//    * Update + recalculate total marks
//    */
//   const result = await prisma.$transaction(async (tx) => {
//     const updated =
//       await tx.assessmentProblem.update({
//         where: {
//           id,
//         },
//         data: {
//           ...(marks !== undefined && { marks }),
//           ...(order !== undefined && { order }),
//         },
//         include: {
//           problem: true,
//         },
//       });

//     /**
//      * Recalculate total marks
//      */
//     const totalMarks = await tx.assessmentProblem.aggregate({
//       where: {
//         assessmentId,
//       },
//       _sum: {
//         marks: true,
//       },
//     });

//     await tx.assessment.update({
//       where: {
//         id: assessmentId,
//       },
//       data: {
//         totalMarks: totalMarks._sum.marks ?? 0,
//       },
//     });

//     return updated;
//   });

//   return result;
// };

// /**
//  * Delete AssessmentProblem
//  */
// const deleteAssessmentProblem = async (
//   userId: string,
//   userRole: Role,
//   assessmentId: string,
//   id: string
// ) => {
//   /**
//    * Check assessment + ownership
//    */
//   const assessment = await checkAssessmentOwnership(
//     assessmentId,
//     userId,
//     userRole
//   );

//   /**
//    * Assessment must be DRAFT
//    */
//   if (assessment.status !== "DRAFT") {
//     throw new ApiError(
//       400,
//       "Problems can only be removed from a draft assessment"
//     );
//   }

//   /**
//    * Find AssessmentProblem
//    */
//   const assessmentProblem =
//     await prisma.assessmentProblem.findFirst({
//       where: {
//         id,
//         assessmentId,
//       },
//     });

//   if (!assessmentProblem) {
//     throw new ApiError(
//       404,
//       "Assessment problem not found"
//     );
//   }

//   /**
//    * Delete + recalculate marks
//    */
//   const result = await prisma.$transaction(async (tx) => {
//     await tx.assessmentProblem.delete({
//       where: {
//         id,
//       },
//     });

//     const totalMarks = await tx.assessmentProblem.aggregate({
//       where: {
//         assessmentId,
//       },
//       _sum: {
//         marks: true,
//       },
//     });

//     await tx.assessment.update({
//       where: {
//         id: assessmentId,
//       },
//       data: {
//         totalMarks: totalMarks._sum.marks ?? 0,
//       },
//     });

//     return {
//       id,
//       assessmentId,
//       deleted: true,
//     };
//   });

//   return result;
// };

export const AssessmentProblemService = {
  createAssessmentProblem,
  getAssessmentProblems,
  getAssessmentProblemById,
//   updateAssessmentProblem,
//   deleteAssessmentProblem,
};