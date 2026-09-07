import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { TestCaseController } from "./testCase.controller.js";
import { createTestCaseValidationSchema } from "./testCase.validation.js";
import { validateRequest } from "../../middlewares/validateRequst.js";

const router = Router();


router.post(
  "/problems/:id",
  auth(Role.ADMIN, Role.COMPANY),
    validateRequest(createTestCaseValidationSchema),
  TestCaseController.createTestCase
);


// router.get(
//   "/problems/:problemId/test-cases",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   TestCaseController.getTestCases
// );


// router.get(
//   "/test-cases/:id",
//   auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
//   TestCaseController.getTestCaseById
// );


// router.patch(
//   "/test-cases/:id",
//   auth(Role.ADMIN, Role.COMPANY),
//   TestCaseController.updateTestCase
// );


// router.delete(
//   "/test-cases/:id",
//   auth(Role.ADMIN, Role.COMPANY),
//   TestCaseController.deleteTestCase
// );

export const TestCaseRoutes = router;