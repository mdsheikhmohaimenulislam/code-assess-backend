import { type Request, type Response } from "express";
export declare const ProblemController: {
	createProblem: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getProblems: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getProblemById: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	updateProblem: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	deleteProblem: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
};
//# sourceMappingURL=problem.controller.d.ts.map
