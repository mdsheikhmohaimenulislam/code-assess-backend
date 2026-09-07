import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import { createAttemptValidationSchema } from "./attempt.validation.js";
import { AttemptController } from "./attempt.controller.js";



const router = Router();


router.post(
  "/",
  auth(Role.CANDIDATE),
  validateRequest(createAttemptValidationSchema),
  AttemptController.createAttempt,
);


router.get(
  "/",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  AttemptController.getAttempts
);


router.get(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  AttemptController.getAttemptById
);


// router.post(
//   "/:id/submit",
//   auth(Role.CANDIDATE),
//   AttemptController.submitAttempt
// );

export const AttemptRoutes = router;