import { Role, SubmissionStatus } from "../../../generated/prisma/enums.js";
declare const evaluateAnswer: (
	answerId: string,
	userId: string,
	userRole: Role,
) => Promise<{
	answer: {
		answer: string | null;
		attemptId: string;
		createdAt: Date;
		id: string;
		isCorrect: boolean | null;
		language: import("../../../generated/prisma/enums.js").ProgrammingLanguage;
		marks: number | null;
		problemId: string;
		updatedAt: Date;
	};
	submission: {
		id: string;
		status: SubmissionStatus;
	};
	evaluation: {
		id: string;
		submissionId: string;
		totalTestCases: number;
		passedTestCases: number;
		failedTestCases: number;
		score: number;
		executionTime: number | null;
		memoryUsed: number | null;
		createdAt: Date;
		updatedAt: Date;
	};
}>;
export declare const EvaluationService: {
	evaluateAnswer: typeof evaluateAnswer;
};
export {};
//# sourceMappingURL=evaluation.service.d.ts.map
