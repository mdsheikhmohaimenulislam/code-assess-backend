import { AssessmentStatus, Role } from "../../../generated/prisma/enums.js";
import type { CreateAssessmentProblemPayload, UpdateAssessmentProblemPayload } from "./assessmentProblem.interface.js";
declare const createAssessmentProblem: (userId: string, userRole: Role, assessmentId: string, payload: CreateAssessmentProblemPayload) => Promise<{
    assessmentId: string;
    id: string;
    marks: number;
    order: number;
    problem: {
        category: string;
        difficulty: import("../../../generated/prisma/enums.js").Difficulty;
        id: string;
        title: string;
        type: import("../../../generated/prisma/enums.js").ProblemType;
    };
    problemId: string;
}>;
declare const getAssessmentProblems: (assessmentId: string) => Promise<{
    assessmentId: string;
    id: string;
    marks: number;
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
    problemId: string;
}[]>;
declare const getAssessmentProblemById: (id: string) => Promise<{
    assessment: {
        id: string;
        status: AssessmentStatus;
        title: string;
    };
    assessmentId: string;
    createdAt: Date;
    id: string;
    marks: number;
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
    problemId: string;
}>;
declare const updateAssessmentProblem: (userId: string, userRole: Role, id: string, payload: UpdateAssessmentProblemPayload) => Promise<{
    assessmentId: string;
    createdAt: Date;
    id: string;
    marks: number;
    order: number;
    problem: {
        category: string;
        description: string;
        difficulty: import("../../../generated/prisma/enums.js").Difficulty;
        id: string;
        title: string;
        type: import("../../../generated/prisma/enums.js").ProblemType;
    };
    problemId: string;
}>;
declare const deleteAssessmentProblem: (userId: string, userRole: Role, id: string) => Promise<{
    assessmentId: string;
    id: string;
    marks: number;
    order: number;
    problemId: string;
}>;
export declare const AssessmentProblemService: {
    createAssessmentProblem: typeof createAssessmentProblem;
    getAssessmentProblems: typeof getAssessmentProblems;
    getAssessmentProblemById: typeof getAssessmentProblemById;
    updateAssessmentProblem: typeof updateAssessmentProblem;
    deleteAssessmentProblem: typeof deleteAssessmentProblem;
};
export {};
//# sourceMappingURL=assessmentProblem.service.d.ts.map