import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { AnswerController } from "./answer.controller.js";
const router = Router();
router.post("/:id", auth(Role.CANDIDATE), AnswerController.createAnswer);
// router.get(
//   "//:attemptId/answers",
//   auth(Role.CANDIDATE, Role.COMPANY, Role.ADMIN),
//   AnswerController.getAnswers
// );
// router.get(
//   "/answers/:id",
//   auth(Role.CANDIDATE, Role.COMPANY, Role.ADMIN),
//   AnswerController.getAnswerById
// );
// router.patch(
//   "/answers/:id",
//   auth(Role.CANDIDATE),
//   AnswerController.updateAnswer
// );
export const AnswerRoutes = router;
//# sourceMappingURL=answer.route.js.map