import type { Request, Response } from "express";
export declare const AssessmentController: {
	createAssessment: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getAssessments: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getAssessmentById: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	updateAssessment: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	deleteAssessment: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	updateAssessmentStatus: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
};
//# sourceMappingURL=assessment.controller.d.ts.map
