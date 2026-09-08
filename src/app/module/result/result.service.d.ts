import { Role } from "../../../generated/prisma/enums.js";
declare const createResult: (attemptId: string, userId: string, userRole: Role) => Promise<{
    attemptId: string;
    createdAt: Date;
    id: string;
    obtainedMarks: number;
    passed: boolean;
    percentage: number;
    rank: number | null;
    totalMarks: number;
}>;
export declare const ResultService: {
    createResult: typeof createResult;
};
export {};
//# sourceMappingURL=result.service.d.ts.map