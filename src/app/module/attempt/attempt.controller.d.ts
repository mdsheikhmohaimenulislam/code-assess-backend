import type { Request, Response } from "express";
export declare const AttemptController: {
	createAttempt: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getAttempts: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getAttemptById: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	submitAttempt: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
};
//# sourceMappingURL=attempt.controller.d.ts.map
