import { ProblemType, Role } from "../../../generated/prisma/enums.js";
import type {
	ICreateProblemPayload,
	IGetProblemsQuery,
	IUpdateProblemPayload,
} from "./problem.interface.js";
declare const createProblem: (
	userId: string,
	payload: ICreateProblemPayload,
) => Promise<
	| ({
			mcqOptions: {
				id: string;
				problemId: string;
				text: string;
				isCorrect: boolean;
				createdAt: Date;
				updatedAt: Date;
			}[];
	  } & {
			id: string;
			title: string;
			description: string;
			type: ProblemType;
			difficulty: import("../../../generated/prisma/enums.js").Difficulty;
			category: string;
			inputFormat: string | null;
			outputFormat: string | null;
			constraints: string | null;
			timeLimit: number | null;
			memoryLimit: number | null;
			createdById: string;
			createdAt: Date;
			updatedAt: Date;
	  })
	| null
>;
declare const getProblems: (query: IGetProblemsQuery) => Promise<{
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	data: {
		category: string;
		constraints: string | null;
		createdAt: Date;
		createdBy: {
			email: string;
			id: string;
			name: string;
			role: Role;
		};
		createdById: string;
		description: string;
		difficulty: import("../../../generated/prisma/enums.js").Difficulty;
		id: string;
		inputFormat: string | null;
		memoryLimit: number | null;
		outputFormat: string | null;
		timeLimit: number | null;
		title: string;
		type: ProblemType;
		updatedAt: Date;
	}[];
}>;
declare const getProblemById: (problemId: string) => Promise<{
	category: string;
	constraints: string | null;
	createdAt: Date;
	createdBy: {
		email: string;
		id: string;
		name: string;
		role: Role;
	};
	createdById: string;
	description: string;
	difficulty: import("../../../generated/prisma/enums.js").Difficulty;
	id: string;
	inputFormat: string | null;
	memoryLimit: number | null;
	outputFormat: string | null;
	timeLimit: number | null;
	title: string;
	type: ProblemType;
	updatedAt: Date;
}>;
declare const updateProblem: (
	userId: string,
	userRole: Role,
	problemId: string,
	payload: IUpdateProblemPayload,
) => Promise<{
	category: string;
	constraints: string | null;
	createdAt: Date;
	createdById: string;
	description: string;
	difficulty: import("../../../generated/prisma/enums.js").Difficulty;
	id: string;
	inputFormat: string | null;
	memoryLimit: number | null;
	outputFormat: string | null;
	timeLimit: number | null;
	title: string;
	type: ProblemType;
	updatedAt: Date;
}>;
declare const deleteProblem: (
	userId: string,
	userRole: Role,
	problemId: string,
) => Promise<void>;
export declare const ProblemService: {
	createProblem: typeof createProblem;
	getProblems: typeof getProblems;
	getProblemById: typeof getProblemById;
	updateProblem: typeof updateProblem;
	deleteProblem: typeof deleteProblem;
};
export {};
//# sourceMappingURL=problem.service.d.ts.map
