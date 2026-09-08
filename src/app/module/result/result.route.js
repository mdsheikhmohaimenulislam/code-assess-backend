import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { ResultController } from "./result.controller.js";
const router = Router();
router.post("/:id", auth(Role.ADMIN, Role.COMPANY), ResultController.createResult);
// router.get(
//   "/attempts/result/:id",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   ResultController.getResultByAttempt
// );
// router.get(
//   "/results/:id",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   ResultController.getResultById
// );
// router.get(
//   "/results",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   ResultController.getResults
// );
export const ResultRoutes = router;
//# sourceMappingURL=result.route.js.map