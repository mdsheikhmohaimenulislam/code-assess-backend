import { AttemptStatus, Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";

// const sendResultEmail = async (
//   email: string,
//   candidateName: string,
//   assessmentTitle: string,
//   totalMarks: number,
//   obtainedMarks: number,
//   percentage: number,
//   passingMarks: number,
//   passed: boolean,
// ) => {
//   await sendEmail({
//     to: email,

//     subject: `Assessment Result - ${assessmentTitle}`,

//     templateName: "assessmentResult",

//     templateData: {
//       candidateName,
//       assessmentTitle,
//       totalMarks,
//       obtainedMarks,
//       percentage,
//       passingMarks,
//       passed,
//     },
//   });
// };

// ============================================
// Create Result
// ============================================

const createResult = async (
  attemptId: string,
  userId: string,
  userRole: Role,
) => {
  // ============================================
  // 1. Validate attempt ID
  // ============================================

  if (!attemptId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Attempt ID is required",
    );
  }

  // ============================================
  // 2. Find attempt
  // ============================================

  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },

    include: {
      // Candidate + User information
      candidate: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      // Assessment information
      assessment: {
        select: {
          id: true,
          title: true,
          totalMarks: true,
          passingMarks: true,
          createdById: true,
        },
      },

      // Coding answers
      answers: {
        select: {
          id: true,
          problemId: true,
          marks: true,
          isCorrect: true,
        },
      },

      // MCQ answers
      mcqAnswers: {
        select: {
          id: true,
          problemId: true,
          marksAwarded: true,
          isCorrect: true,
        },
      },

      // Submissions
      submissions: {
        select: {
          id: true,
          problemId: true,
          score: true,
          status: true,
        },
      },
    },
  });

  // ============================================
  // 3. Attempt not found
  // ============================================

  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  // ============================================
  // 4. Company ownership check
  // ============================================

  if (
    userRole === Role.COMPANY &&
    attempt.assessment.createdById !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to create this result",
    );
  }

  // ============================================
  // 5. Attempt must be submitted
  // ============================================

  if (attempt.status !== AttemptStatus.SUBMITTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Attempt must be submitted before creating result",
    );
  }

  // ============================================
  // 6. Check existing result
  // ============================================

  const existingResult = await prisma.result.findUnique({
    where: {
      attemptId,
    },
  });

  if (existingResult) {
    return existingResult;
  }

  // ============================================
  // 7. Calculate Coding Marks
  // ============================================

  const codingMarks = attempt.answers.reduce(
    (total, answer) => {
      return total + (answer.marks ?? 0);
    },
    0,
  );

  // ============================================
  // 8. Calculate MCQ Marks
  // ============================================

  const mcqMarks = attempt.mcqAnswers.reduce(
    (total, answer) => {
      return total + (answer.marksAwarded ?? 0);
    },
    0,
  );

  // ============================================
  // 9. Calculate Obtained Marks
  // ============================================

  const obtainedMarks =
    codingMarks + mcqMarks;

  // ============================================
  // 10. Total Assessment Marks
  // ============================================

  const totalMarks =
    attempt.assessment.totalMarks;

  // ============================================
  // 11. Calculate Percentage
  // ============================================

  const percentage =
    totalMarks > 0
      ? Number(
          (
            (obtainedMarks / totalMarks) *
            100
          ).toFixed(2),
        )
      : 0;

  // ============================================
  // 12. Check Pass / Fail
  // ============================================

  const passed =
    obtainedMarks >=
    attempt.assessment.passingMarks;

  // ============================================
  // 13. Create Result
  // ============================================

  const result = await prisma.result.create({
    data: {
      attemptId: attempt.id,
      totalMarks,
      obtainedMarks,
      percentage,
      passed,
    },

    select: {
      id: true,
      attemptId: true,
      totalMarks: true,
      obtainedMarks: true,
      percentage: true,
      passed: true,
      rank: true,
      createdAt: true,
    },
  });

  // ============================================
  // 14. Send Result Email
  // ============================================

//   try {
//     await sendResultEmail(
//       attempt.candidate.user.email,
//       attempt.candidate.user.name,
//       attempt.assessment.title,
//       totalMarks,
//       obtainedMarks,
//       percentage,
//       attempt.assessment.passingMarks,
//       passed,
//     );
//   } catch (error) {
//     console.error(
//       "Result created successfully, but result email failed:",
//       error,
//     );
//   }

  // ============================================
  // 15. Return Result
  // ============================================

  return result;
};


// const getResultByAttempt = async (
//   userId: string,
//   userRole: string,
//   attemptId: string
// ) => {
//   const result = await prisma.result.findUnique({
//     where: { attemptId },
//     include: {
//       assessment: true,
//       candidate: true,
//     },
//   });

//   if (!result) {
//     throw new Error("Result not found");
//   }

//   if (
//     userRole === "CANDIDATE" &&
//     result.candidate.userId !== userId
//   ) {
//     throw new Error("You are not allowed to view this result");
//   }

//   return result;
// };

// const getResultById = async (
//   userId: string,
//   userRole: string,
//   id: string
// ) => {
//   const result = await prisma.result.findUnique({
//     where: { id },
//     include: {
//       assessment: true,
//       candidate: true,
//     },
//   });

//   if (!result) {
//     throw new Error("Result not found");
//   }

//   if (
//     userRole === "CANDIDATE" &&
//     result.candidate.userId !== userId
//   ) {
//     throw new Error("You are not allowed to view this result");
//   }

//   return result;
// };

// const getResults = async (
//   userId: string,
//   userRole: string
// ) => {
//   if (userRole === "CANDIDATE") {
//     const candidate =
//       await prisma.candidateProfile.findUnique({
//         where: { userId },
//       });

//     if (!candidate) {
//       throw new Error("Candidate profile not found");
//     }

//     return prisma.result.findMany({
//       where: {
//         candidateId: candidate.id,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//   }

//   if (userRole === "COMPANY") {
//     return prisma.result.findMany({
//       where: {
//         assessment: {
//           createdById: userId,
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//   }

//   return prisma.result.findMany({
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// };

export const ResultService = {
  createResult,
  //   getResultByAttempt,
  //   getResultById,
  //   getResults,
};
