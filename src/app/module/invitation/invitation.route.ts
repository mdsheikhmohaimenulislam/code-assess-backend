import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import { createInvitationValidationSchema } from "./invitation.validation.js";
import { InvitationController } from "./invitation.controller.js";


const router = Router();


router.post(
  "/",
  auth(Role.ADMIN, Role.COMPANY),
  validateRequest(createInvitationValidationSchema),
  InvitationController.createInvitation,
);

// router.get(
//   "/",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   InvitationController.getInvitations
// );


// router.get(
//   "/:id",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   InvitationController.getInvitationById
// );


// router.patch(
//   "/:id/accept",
//   auth(Role.CANDIDATE),
//   InvitationController.acceptInvitation
// );


// router.patch(
//   "/:id/reject",
//   auth(Role.CANDIDATE),
//   InvitationController.rejectInvitation
// );


// router.delete(
//   "/:id",
//   auth(Role.ADMIN, Role.COMPANY),
//   InvitationController.deleteInvitation
// );

export const InvitationRoutes = router;