import { AssessmentAccessType, AssessmentStatus, Role } from "../../../generated/prisma/enums.js";
import type { ICreateAssessmentPayload, UpdateAssessmentPayload } from "./assessment.interface.js";
declare const createAssessment: (userId: string, userRole: Role, payload: ICreateAssessmentPayload) => Promise<{
    accessType: AssessmentAccessType;
    company: {
        companyName: string;
        id: string;
    };
    companyId: string;
    createdAt: Date;
    createdById: string;
    description: string | null;
    duration: number;
    endTime: Date | null;
    id: string;
    passingMarks: number;
    price: import("@prisma/client-runtime-utils").Decimal | null;
    startTime: Date | null;
    status: AssessmentStatus;
    title: string;
    totalMarks: number;
    updatedAt: Date;
}>;
declare const getAssessments: (query: Record<string, unknown>) => Promise<{
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data: {
        _count: {
            attempts: number;
            invitations: number;
            problems: number;
        };
        accessType: AssessmentAccessType;
        company: {
            companyName: string;
            id: string;
        };
        companyId: string;
        createdAt: Date;
        createdBy: {
            email: string;
            id: string;
            name: string;
        };
        createdById: string;
        description: string | null;
        duration: number;
        endTime: Date | null;
        id: string;
        passingMarks: number;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        startTime: Date | null;
        status: AssessmentStatus;
        title: string;
        totalMarks: number;
        updatedAt: Date;
    }[];
}>;
declare const getAssessmentById: (assessmentId: string) => Promise<{
    _count: {
        attempts: number;
        invitations: number;
        payments: number;
        problems: number;
    };
    accessType: AssessmentAccessType;
    company: {
        companyName: string;
        description: string | null;
        id: string;
        logo: string | null;
        website: string | null;
    };
    companyId: string;
    createdAt: Date;
    createdBy: {
        email: string;
        id: string;
        name: string;
        role: Role;
    };
    createdById: string;
    description: string | null;
    duration: number;
    endTime: Date | null;
    id: string;
    passingMarks: number;
    price: import("@prisma/client-runtime-utils").Decimal | null;
    problems: {
        id: string;
        order: number;
        problem: {
            category: string;
            constraints: string | null;
            description: string;
            difficulty: import("../../../generated/prisma/enums.js").Difficulty;
            id: string;
            inputFormat: string | null;
            memoryLimit: number | null;
            outputFormat: string | null;
            timeLimit: number | null;
            title: string;
            type: import("../../../generated/prisma/enums.js").ProblemType;
        };
    }[];
    startTime: Date | null;
    status: AssessmentStatus;
    title: string;
    totalMarks: number;
    updatedAt: Date;
}>;
declare const updateAssessment: (userId: string, userRole: Role, assessmentId: string, payload: UpdateAssessmentPayload) => Promise<{
    id: string;
    title: string;
    description: string | null;
    duration: number;
    startTime: Date | null;
    endTime: Date | null;
    totalMarks: number;
    passingMarks: number;
    accessType: AssessmentAccessType;
    price: import("@prisma/client-runtime-utils").Decimal | null;
    status: AssessmentStatus;
    companyId: string;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const deleteAssessment: (userId: string, userRole: Role, assessmentId: string) => Promise<{
    id: string;
    title: string;
}>;
declare const updateAssessmentStatus: (userId: string, userRole: Role, assessmentId: string, status: AssessmentStatus) => Promise<{
    id: string;
    title: string;
    description: string | null;
    duration: number;
    startTime: Date | null;
    endTime: Date | null;
    totalMarks: number;
    passingMarks: number;
    accessType: AssessmentAccessType;
    price: import("@prisma/client-runtime-utils").Decimal | null;
    status: AssessmentStatus;
    companyId: string;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const AssessmentService: {
    createAssessment: typeof createAssessment;
    getAssessments: typeof getAssessments;
    getAssessmentById: typeof getAssessmentById;
    updateAssessment: typeof updateAssessment;
    deleteAssessment: typeof deleteAssessment;
    updateAssessmentStatus: typeof updateAssessmentStatus;
};
export {};
//# sourceMappingURL=assessment.service.d.ts.map