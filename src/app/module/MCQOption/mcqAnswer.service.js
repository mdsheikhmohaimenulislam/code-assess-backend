import httpStatus from "http-status";
import { AttemptStatus, ProblemType } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
const createMCQAnswer = async (userId, payload) => {
    const { attemptId, problemId, selectedOptionId } = payload;
    // --------------------------------
    // 1. Find candidate profile
    // --------------------------------
    const candidate = await prisma.candidateProfile.findUnique({
        where: {
            userId,
        },
        select: {
            id: true,
            userId: true,
        },
    });
    if (!candidate) {
        throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
    }
    // --------------------------------
    // 2. Find attempt
    // --------------------------------
    const attempt = await prisma.attempt.findUnique({
        where: {
            id: attemptId,
        },
        select: {
            id: true,
            userId: true,
            candidateId: true,
            assessmentId: true,
            status: true,
            expiresAt: true,
        },
    });
    if (!attempt) {
        throw new AppError(httpStatus.NOT_FOUND, "Attempt not found");
    }
    // --------------------------------
    // 3. Check attempt ownership
    // --------------------------------
    if (attempt.userId !== userId || attempt.candidateId !== candidate.id) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to answer this attempt");
    }
    // --------------------------------
    // 4. Check attempt status
    // --------------------------------
    if (attempt.status === AttemptStatus.SUBMITTED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Attempt has already been submitted");
    }
    if (attempt.status === AttemptStatus.EXPIRED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Attempt has already expired");
    }
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
        throw new AppError(httpStatus.BAD_REQUEST, "Only an in-progress attempt can be answered");
    }
    // --------------------------------
    // 5. Check attempt expiration
    // --------------------------------
    const now = new Date();
    if (attempt.expiresAt && now >= attempt.expiresAt) {
        await prisma.attempt.update({
            where: {
                id: attempt.id,
            },
            data: {
                status: AttemptStatus.EXPIRED,
            },
        });
        throw new AppError(httpStatus.BAD_REQUEST, "Attempt time has expired");
    }
    // --------------------------------
    // 6. Check problem
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
        throw new AppError(httpStatus.NOT_FOUND, "Problem not found");
    }
    // --------------------------------
    // 7. Problem must be MCQ
    // --------------------------------
    if (problem.type !== ProblemType.MCQ) {
        throw new AppError(httpStatus.BAD_REQUEST, "This problem is not an MCQ");
    }
    // --------------------------------
    // 8. Check problem belongs to assessment
    // --------------------------------
    const assessmentProblem = await prisma.assessmentProblem.findUnique({
        where: {
            assessmentId_problemId: {
                assessmentId: attempt.assessmentId,
                problemId,
            },
        },
        select: {
            id: true,
            marks: true,
        },
    });
    if (!assessmentProblem) {
        throw new AppError(httpStatus.BAD_REQUEST, "This problem does not belong to this assessment");
    }
    // --------------------------------
    // 9. Check selected option
    // --------------------------------
    const selectedOption = await prisma.mCQOption.findUnique({
        where: {
            id: selectedOptionId,
        },
        select: {
            id: true,
            problemId: true,
            text: true,
            isCorrect: true,
        },
    });
    if (!selectedOption) {
        throw new AppError(httpStatus.NOT_FOUND, "Selected option not found");
    }
    // --------------------------------
    // 10. Option must belong to problem
    // --------------------------------
    if (selectedOption.problemId !== problemId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Selected option does not belong to this problem");
    }
    // --------------------------------
    // 11. Calculate marks
    // --------------------------------
    const isCorrect = selectedOption.isCorrect;
    const marksAwarded = isCorrect ? assessmentProblem.marks : 0;
    // --------------------------------
    // 12. Check existing answer
    // --------------------------------
    const existingAnswer = await prisma.mCQAnswer.findUnique({
        where: {
            attemptId_problemId: {
                attemptId,
                problemId,
            },
        },
        select: {
            id: true,
        },
    });
    // --------------------------------
    // 13. Update existing answer
    // --------------------------------
    if (existingAnswer) {
        const updatedAnswer = await prisma.mCQAnswer.update({
            where: {
                id: existingAnswer.id,
            },
            data: {
                selectedOptionId,
                isCorrect,
                marksAwarded,
            },
            include: {
                selectedOption: {
                    select: {
                        id: true,
                        text: true,
                        isCorrect: true,
                    },
                },
            },
        });
        return updatedAnswer;
    }
    // --------------------------------
    // 14. Create new answer
    // --------------------------------
    const answer = await prisma.mCQAnswer.create({
        data: {
            attemptId,
            problemId,
            selectedOptionId,
            isCorrect,
            marksAwarded,
        },
        include: {
            selectedOption: {
                select: {
                    id: true,
                    text: true,
                    isCorrect: true,
                },
            },
        },
    });
    return answer;
};
export const MCQAnswerService = {
    createMCQAnswer,
};
//# sourceMappingURL=mcqAnswer.service.js.map