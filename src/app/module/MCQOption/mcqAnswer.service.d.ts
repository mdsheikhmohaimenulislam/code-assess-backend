import type { CreateMCQAnswerPayload } from "./mcqAnswer.interface.js";
declare const createMCQAnswer: (
	userId: string,
	payload: CreateMCQAnswerPayload,
) => Promise<
	{
		selectedOption: {
			id: string;
			isCorrect: boolean;
			text: string;
		};
	} & {
		id: string;
		attemptId: string;
		problemId: string;
		selectedOptionId: string;
		isCorrect: boolean;
		marksAwarded: number;
		createdAt: Date;
		updatedAt: Date;
	}
>;
export declare const MCQAnswerService: {
	createMCQAnswer: typeof createMCQAnswer;
};
export {};
//# sourceMappingURL=mcqAnswer.service.d.ts.map
