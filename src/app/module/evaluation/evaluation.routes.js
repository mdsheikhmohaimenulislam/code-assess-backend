import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { EvaluationController } from "./evaluation.controller.js";
const router = Router();
router.post("/answer/:id", auth(Role.ADMIN, Role.COMPANY), EvaluationController.evaluateSubmission);
// router.get(
//   "/submissions/:submissionId/evaluation",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   EvaluationController.getEvaluationBySubmission
// );
// router.get(
//   "/evaluations/:id",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   EvaluationController.getEvaluationById
// );
export const EvaluationRoutes = router;
//# sourceMappingURL=evaluation.routes.js.map