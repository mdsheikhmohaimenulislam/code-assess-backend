import type { Request, Response } from "express";
export declare const InvitationController: {
    createInvitation: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getInvitations: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getInvitationById: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    acceptInvitation: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    rejectInvitation: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteInvitation: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=invitation.controller.d.ts.map