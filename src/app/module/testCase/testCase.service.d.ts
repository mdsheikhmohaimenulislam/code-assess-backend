import { ProblemType, Role } from "../../../generated/prisma/enums.js";
import type { CreateTestCasePayload, UpdateTestCasePayload } from "./testCase.interface.js";
declare const createTestCase: (userId: string, userRole: Role, problemId: string, payload: CreateTestCasePayload) => Promise<{
    id: string;
    problemId: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const getTestCase: (userId: string, userRole: Role, testCaseId: string) => Promise<{
    createdAt: Date;
    expectedOutput: string;
    id: string;
    input: string;
    isHidden: boolean;
    problem: {
        createdById: string;
        id: string;
        type: ProblemType;
    };
    problemId: string;
    updatedAt: Date;
} | {
    id: string;
    problemId: string;
    input: string;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const updateTestCase: (userId: string, userRole: Role, id: string, payload: UpdateTestCasePayload) => Promise<{
    id: string;
    problemId: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const deleteTestCase: (userId: string, userRole: Role, id: string) => Promise<void>;
export declare const TestCaseService: {
    createTestCase: typeof createTestCase;
    getTestCase: typeof getTestCase;
    updateTestCase: typeof updateTestCase;
    deleteTestCase: typeof deleteTestCase;
};
export {};
//# sourceMappingURL=testCase.service.d.ts.map