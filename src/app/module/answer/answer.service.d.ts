import { ProgrammingLanguage } from "../../../generated/prisma/enums.js";
declare const createAnswer: (userId: string, attemptId: string, problemId: string, answer: string, language: ProgrammingLanguage) => Promise<{
    answer: string | null;
    attemptId: string;
    createdAt: Date;
    id: string;
    isCorrect: boolean | null;
    language: ProgrammingLanguage;
    marks: number | null;
    problemId: string;
    updatedAt: Date;
}>;
export declare const AnswerService: {
    createAnswer: typeof createAnswer;
};
export {};
//# sourceMappingURL=answer.service.d.ts.map