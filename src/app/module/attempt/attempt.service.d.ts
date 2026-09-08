import { AssessmentStatus, AttemptStatus, Role } from "../../../generated/prisma/enums.js";
import type { GetAttemptsParams } from "./attempt.interface.js";
declare const createAttempt: (userId: string, assessmentId: string) => Promise<{
    assessment: {
        description: string | null;
        duration: number;
        endTime: Date | null;
        id: string;
        passingMarks: number;
        startTime: Date | null;
        title: string;
        totalMarks: number;
    };
    assessmentId: string;
    candidate: {
        id: string;
        userId: string;
    };
    candidateId: string;
    createdAt: Date;
    expiresAt: Date | null;
    id: string;
    startedAt: Date;
    status: AttemptStatus;
    userId: string;
}>;
declare const getAttempts: ({ userId, userRole, page, limit, }: GetAttemptsParams) => Promise<{
    data: ({
        assessment: {
            duration: number;
            id: string;
            passingMarks: number;
            status: AssessmentStatus;
            title: string;
            totalMarks: number;
        };
        candidate: {
            id: string;
            userId: string;
        };
    } & {
        id: string;
        assessmentId: string;
        userId: string;
        candidateId: string;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        status: AttemptStatus;
        score: number;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
declare const getAttemptById: (userId: string, userRole: Role, attemptId: string) => Promise<{
    assessment: {
        description: string | null;
        duration: number;
        endTime: Date | null;
        id: string;
        passingMarks: number;
        startTime: Date | null;
        status: AssessmentStatus;
        title: string;
        totalMarks: number;
    };
    candidate: {
        id: string;
        userId: string;
    };
} & {
    id: string;
    assessmentId: string;
    userId: string;
    candidateId: string;
    startedAt: Date;
    submittedAt: Date | null;
    expiresAt: Date | null;
    status: AttemptStatus;
    score: number;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const submitAttempt: (userId: string, attemptId: string) => Promise<{
    assessment: {
        id: string;
        passingMarks: number;
        title: string;
        totalMarks: number;
    };
} & {
    id: string;
    assessmentId: string;
    userId: string;
    candidateId: string;
    startedAt: Date;
    submittedAt: Date | null;
    expiresAt: Date | null;
    status: AttemptStatus;
    score: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const AttemptService: {
    createAttempt: typeof createAttempt;
    getAttempts: typeof getAttempts;
    getAttemptById: typeof getAttemptById;
    submitAttempt: typeof submitAttempt;
};
export {};
//# sourceMappingURL=attempt.service.d.ts.map