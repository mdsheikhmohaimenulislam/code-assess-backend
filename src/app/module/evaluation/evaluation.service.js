import httpStatus from "http-status";
import { ProblemType, Role, SubmissionStatus } from "../../../generated/prisma/enums.js";
import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";
const evaluateAnswer = async (answerId, userId, userRole) => {
    // --------------------------------
    // 1. Validate Answer ID
    // --------------------------------
    if (!answerId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Answer ID is required");
    }
    // --------------------------------
    // 2. Find Answer
    // --------------------------------
    const answer = await prisma.answer.findUnique({
        where: {
            id: answerId,
        },
        include: {
            problem: {
                include: {
                    testCases: true,
                },
            },
            attempt: {
                include: {
                    assessment: {
                        select: {
                            id: true,
                            createdById: true,
                            companyId: true,
                        },
                    },
                },
            },
        },
    });
    if (!answer) {
        throw new AppError(httpStatus.NOT_FOUND, "Answer not found");
    }
    // --------------------------------
    // 3. Authorization
    // --------------------------------
    if (userRole === Role.COMPANY &&
        answer.attempt.assessment.createdById !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to evaluate this answer");
    }
    // --------------------------------
    // 4. Check problem type
    // --------------------------------
    if (answer.problem.type !== ProblemType.CODING) {
        throw new AppError(httpStatus.BAD_REQUEST, "Only coding answers can be evaluated");
    }
    // --------------------------------
    // 5. Check answer/code
    // --------------------------------
    if (!answer.answer || !answer.answer.trim()) {
        throw new AppError(httpStatus.BAD_REQUEST, "Answer code is empty");
    }
    // --------------------------------
    // 6. Check test cases
    // --------------------------------
    const testCases = answer.problem.testCases;
    if (testCases.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "No test cases found for this problem");
    }
    // --------------------------------
    // 7. Check problem belongs to assessment
    // --------------------------------
    const assessmentProblem = await prisma.assessmentProblem.findUnique({
        where: {
            assessmentId_problemId: {
                assessmentId: answer.attempt.assessmentId,
                problemId: answer.problemId,
            },
        },
        select: {
            marks: true,
        },
    });
    if (!assessmentProblem) {
        throw new AppError(httpStatus.BAD_REQUEST, "Problem does not belong to this assessment");
    }
    // --------------------------------
    // 8. Find existing submission
    // --------------------------------
    let submission = await prisma.submission.findFirst({
        where: {
            attemptId: answer.attemptId,
            problemId: answer.problemId,
        },
        select: {
            id: true,
            status: true,
        },
    });
    // --------------------------------
    // 9. Execute code
    // --------------------------------
    /*
      এখানে পরে Judge0 / custom sandbox ব্যবহার করবে।
  
      আপাতত placeholder হিসেবে
      সব test case passed ধরা হচ্ছে।
    */
    const totalTestCases = testCases.length;
    const passedTestCases = totalTestCases;
    const failedTestCases = totalTestCases - passedTestCases;
    // --------------------------------
    // 10. Calculate marks
    // --------------------------------
    const score = totalTestCases > 0
        ? (passedTestCases / totalTestCases) *
            assessmentProblem.marks
        : 0;
    const isCorrect = passedTestCases === totalTestCases;
    // --------------------------------
    // 11. Submission status
    // --------------------------------
    const status = isCorrect
        ? SubmissionStatus.ACCEPTED
        : SubmissionStatus.WRONG_ANSWER;
    // --------------------------------
    // 12. Transaction
    // --------------------------------
    const result = await prisma.$transaction(async (tx) => {
        // ------------------------------
        // Create / Update Submission
        // ------------------------------
        if (submission) {
            submission = await tx.submission.update({
                where: {
                    id: submission.id,
                },
                data: {
                    code: answer.answer,
                    language: answer.language,
                    status,
                    score,
                    submittedAt: new Date(),
                },
                select: {
                    id: true,
                    attemptId: true,
                    problemId: true,
                    code: true,
                    language: true,
                    status: true,
                    score: true,
                    submittedAt: true,
                },
            });
        }
        else {
            submission = await tx.submission.create({
                data: {
                    attemptId: answer.attemptId,
                    problemId: answer.problemId,
                    code: answer.answer,
                    language: answer.language,
                    status,
                    score,
                },
                select: {
                    id: true,
                    attemptId: true,
                    problemId: true,
                    code: true,
                    language: true,
                    status: true,
                    score: true,
                    submittedAt: true,
                },
            });
        }
        // ------------------------------
        // Update Answer
        // ------------------------------
        const updatedAnswer = await tx.answer.update({
            where: {
                id: answerId,
            },
            data: {
                marks: score,
                isCorrect,
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
        // ------------------------------
        // Evaluation
        // ------------------------------
        const existingEvaluation = await tx.evaluation.findUnique({
            where: {
                submissionId: submission.id,
            },
        });
        let evaluation;
        if (existingEvaluation) {
            evaluation =
                await tx.evaluation.update({
                    where: {
                        submissionId: submission.id,
                    },
                    data: {
                        totalTestCases,
                        passedTestCases,
                        failedTestCases,
                        score,
                    },
                });
        }
        else {
            evaluation =
                await tx.evaluation.create({
                    data: {
                        submissionId: submission.id,
                        totalTestCases,
                        passedTestCases,
                        failedTestCases,
                        score,
                    },
                });
        }
        return {
            answer: updatedAnswer,
            submission,
            evaluation,
        };
    });
    return result;
};
// const getProblemMarks = async (
//   assessmentId: string,
//   problemId: string
// ) => {
//   const assessmentProblem =
//     await prisma.assessmentProblem.findUnique({
//       where: {
//         assessmentId_problemId: {
//           assessmentId,
//           problemId,
//         },
//       },
//     });
//   if (!assessmentProblem) {
//     throw new Error("Assessment problem not found");
//   }
//   return assessmentProblem.marks;
// };
// const getEvaluationBySubmission = async (
//   userId: string,
//   userRole: string,
//   submissionId: string
// ) => {
//   const evaluation = await prisma.evaluation.findUnique({
//     where: { submissionId },
//     include: {
//       submission: {
//         include: {
//           attempt: {
//             include: {
//               candidate: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   if (!evaluation) {
//     throw new Error("Evaluation not found");
//   }
//   if (
//     userRole === "CANDIDATE" &&
//     evaluation.submission.attempt.candidate.userId !== userId
//   ) {
//     throw new Error("You are not allowed to view this evaluation");
//   }
//   return evaluation;
// };
// const getEvaluationById = async (
//   userId: string,
//   userRole: string,
//   id: string
// ) => {
//   const evaluation = await prisma.evaluation.findUnique({
//     where: { id },
//     include: {
//       submission: {
//         include: {
//           attempt: {
//             include: {
//               candidate: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   if (!evaluation) {
//     throw new Error("Evaluation not found");
//   }
//   if (
//     userRole === "CANDIDATE" &&
//     evaluation.submission.attempt.candidate.userId !== userId
//   ) {
//     throw new Error("You are not allowed to view this evaluation");
//   }
//   return evaluation;
// };
export const EvaluationService = {
    evaluateAnswer,
    //   getEvaluationBySubmission,
    //   getEvaluationById,
};
//# sourceMappingURL=evaluation.service.js.map