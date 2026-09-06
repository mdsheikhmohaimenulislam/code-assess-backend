import { Router } from "express";

import { Role } from "../../../generated/prisma/enums.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import { createAssessmentProblemValidationSchema } from "./assessmentProblem.validation.js";
import { AssessmentProblemController } from "./assessmentProblem.controller.js";
import { auth } from "../../middlewares/checkAuth.js";

const router = Router();

router.post(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY),
  validateRequest(createAssessmentProblemValidationSchema),
  AssessmentProblemController.createAssessmentProblem,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  AssessmentProblemController.getAssessmentProblems
);

router.get(
  "/assessment-problem/:id",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  AssessmentProblemController.getAssessmentProblemById,
);
// router.patch(
//   "/:assessmentId/problems/:id",
//   auth(Role.ADMIN, Role.COMPANY),
//   validateRequest(updateAssessmentProblemValidationSchema),
//   AssessmentProblemController.updateAssessmentProblem
// );

// router.delete(
//   "/:assessmentId/problems/:id",
//   auth(Role.ADMIN, Role.COMPANY),
//   AssessmentProblemController.deleteAssessmentProblem
// );

export const AssessmentProblemRoutes = router;
