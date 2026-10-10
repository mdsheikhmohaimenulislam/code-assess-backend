import { Router } from "express";

import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequst.js";

import { SubmissionController } from "./submission.controller.js";
import { updateSubmissionValidationSchema } from "./submission.validation.js";

const router = Router();

// Candidate: নিজের submissions
router.get(
  "/my",
  auth(Role.CANDIDATE),
  SubmissionController.getMySubmissions,
);

// Admin and Company: all submissions
router.get(
  "/",
  auth(Role.ADMIN, Role.COMPANY),
  SubmissionController.getAllSubmissions,
);

// Admin and Company: single submission
router.get(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY),
  SubmissionController.getSubmissionById,
);

// Admin and Company: update submission
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY),
  validateRequest(updateSubmissionValidationSchema),
  SubmissionController.updateSubmission,
);

export const SubmissionRoutes = router;