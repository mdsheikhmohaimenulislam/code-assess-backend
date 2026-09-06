import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import { AssessmentController } from "./assessment.controller.js";
import { createAssessmentValidationSchema } from "./assessment.validation.js";



const router = Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.COMPANY),
  validateRequest(createAssessmentValidationSchema),
  AssessmentController.createAssessment,
);

router.get(
  "/",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  AssessmentController.getAssessments,
);

// router.get(
//   "/:id",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   AssessmentController.getAssessmentById,
// );

// router.patch(
//   "/:id",
//   auth(Role.ADMIN, Role.COMPANY),
//   validateRequest(updateAssessmentValidationSchema),
//   AssessmentController.updateAssessment,
// );

// router.delete(
//   "/:id",
//   auth(Role.ADMIN, Role.COMPANY),
//   AssessmentController.deleteAssessment,
// );

// router.patch(
//   "/:id/publish",
//   auth(Role.ADMIN, Role.COMPANY),
//   AssessmentController.publishAssessment,
// );

// router.patch(
//   "/:id/cancel",
//   auth(Role.ADMIN, Role.COMPANY),
//   AssessmentController.cancelAssessment,
// );

// router.patch(
//   "/:id/complete",
//   auth(Role.ADMIN, Role.COMPANY),
//   AssessmentController.completeAssessment,
// );

export const AssessmentRoutes = router;