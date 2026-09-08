import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import { AssessmentController } from "./assessment.controller.js";
import {
	createAssessmentValidationSchema,
	updateAssessmentValidationSchema,
} from "./assessment.validation.js";
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
router.get(
	"/:id",
	auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
	AssessmentController.getAssessmentById,
);
router.patch(
	"/:id",
	auth(Role.ADMIN, Role.COMPANY),
	validateRequest(updateAssessmentValidationSchema),
	AssessmentController.updateAssessment,
);
router.delete(
	"/:id",
	auth(Role.ADMIN, Role.COMPANY),
	AssessmentController.deleteAssessment,
);
router.patch(
	"/status/:id",
	auth(Role.ADMIN, Role.COMPANY),
	AssessmentController.updateAssessmentStatus,
);
export const AssessmentRoutes = router;
//# sourceMappingURL=assessment.route.js.map
