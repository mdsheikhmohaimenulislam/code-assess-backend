import type { Request, Response } from "express";
export declare const PaymentController: {
	createPayment: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
	executePayment: (
		req: Request,
		res: Response,
		next: import("express").NextFunction,
	) => Promise<void>;
};
//# sourceMappingURL=payment.controller.d.ts.map
