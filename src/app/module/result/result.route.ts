import { Router } from "express";

import { Role } from "../../../generated/prisma/enums.js";

import { auth } from "../../middlewares/checkAuth.js";
import { ResultController } from "./result.controller.js";

const router = Router();

// Candidate starts/submits an assessment result
router.post(
  "/assessment/:assessmentId",
  auth(Role.CANDIDATE),
  ResultController.createResult,
);

// Candidate নিজের একটি result দেখতে পারবে
router.get(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  ResultController.getResultById,
);

// Candidate নিজের সব result দেখতে পারবে
router.get(
  "/my-results",
  auth(Role.CANDIDATE),
  ResultController.getMyResults,
);

// Admin / Company assessment-এর candidate results দেখতে পারবে
router.get(
  "/assessment/:assessmentId",
  auth(Role.ADMIN, Role.COMPANY),
  ResultController.getAssessmentResults,
);

export const ResultRoutes = router;