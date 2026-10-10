import { Router } from "express";

import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import { AnswerController } from "./answer.controller.js";
import { createAnswerValidationSchema } from "./answer.validation.js";

const router = Router();

router.post(
  "/:AnswerId",
  auth(Role.CANDIDATE),
  validateRequest(createAnswerValidationSchema),
  AnswerController.submitAnswer,
);

export const AnswerRoutes = router;