import type { Request, Response } from "express";
export declare const CandidateController: {
	createCandidate: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getMyCandidate: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getCandidateById: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	updateCandidate: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	deleteCandidate: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
};
//# sourceMappingURL=candidate.controller.d.ts.map
