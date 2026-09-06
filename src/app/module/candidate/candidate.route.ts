import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { createCandidateValidationSchema, updateCandidateValidationSchema } from "./candidate.validation.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import { CandidateController } from "./candidate.controller.js";

const router = Router();

router.post(
  "/",
  auth(Role.CANDIDATE),
  validateRequest(createCandidateValidationSchema),
  CandidateController.createCandidate,
);

router.get("/me", auth(Role.CANDIDATE), CandidateController.getMyCandidate);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  CandidateController.getCandidateById,
);

router.patch(
  "/:id",
  auth(Role.CANDIDATE),
  validateRequest(updateCandidateValidationSchema),
  CandidateController.updateCandidate
);

router.delete(
  "/:id",
  auth(Role.CANDIDATE),
  CandidateController.deleteCandidate,
);

export const CandidateRoutes = router;
