import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import {
	createProblemValidationSchema,
	updateProblemValidationSchema,
} from "./problem.validation.js";
import { ProblemController } from "./problem.controller.js";
const route = Router();
route.post(
	"/",
	auth(Role.ADMIN, Role.COMPANY),
	validateRequest(createProblemValidationSchema),
	ProblemController.createProblem,
);
route.get(
	"/",
	auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
	ProblemController.getProblems,
);
route.get(
	"/:id",
	auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
	ProblemController.getProblemById,
);
route.patch(
	"/:id",
	auth(Role.ADMIN, Role.COMPANY),
	validateRequest(updateProblemValidationSchema),
	ProblemController.updateProblem,
);
route.delete(
	"/:id",
	auth(Role.ADMIN, Role.COMPANY),
	ProblemController.deleteProblem,
);
export const problemRoute = route;
//# sourceMappingURL=problem.route.js.map
