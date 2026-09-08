import type { Request, Response } from "express";
export declare const CompanyController: {
	createCompany: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getMyCompany: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getCompanyById: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	updateCompany: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	deleteCompany: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
};
//# sourceMappingURL=company.controller.d.ts.map
