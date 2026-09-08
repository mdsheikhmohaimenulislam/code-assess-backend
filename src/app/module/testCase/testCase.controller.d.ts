import type { Request, Response } from "express";
export declare const TestCaseController: {
	createTestCase: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getTestCases: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	updateTestCase: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	deleteTestCase: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
};
//# sourceMappingURL=testCase.controller.d.ts.map
