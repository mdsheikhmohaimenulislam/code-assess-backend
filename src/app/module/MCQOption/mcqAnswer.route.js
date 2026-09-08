import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { MCQAnswerController } from "./mcqAnswer.controller.js";
import { createMCQAnswerValidationSchema } from "./mcqAnswer.validation.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
const router = Router();
router.post("/", auth(Role.CANDIDATE), validateRequest(createMCQAnswerValidationSchema), MCQAnswerController.createMCQAnswer);
export const MCQAnswerRoutes = router;
//# sourceMappingURL=mcqAnswer.route.js.map