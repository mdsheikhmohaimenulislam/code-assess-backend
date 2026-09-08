import type { Request, Response } from "express";
export declare const UserController: {
	getAllUsers: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	permanentlyDeleteUser: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	updateMyProfile: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	getSingleUser: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	updateUserStatus: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	deleteUser: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
};
//# sourceMappingURL=user.controller.d.ts.map
