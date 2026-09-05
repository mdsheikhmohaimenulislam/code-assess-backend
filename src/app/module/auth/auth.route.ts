import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequst.js";
import { UserValidation } from "./auth.validation.js";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthController } from "./auth.controller.js";

const router = Router();

router.post(
  "/register",

  validateRequest(UserValidation.RegistrationZodSchema),
  AuthController.register,
);

router.post(
  "/verify-email",
  validateRequest(UserValidation.EmailVerifyZodSchema),
  AuthController.verifyEmail,
);

router.post(
  "/login",
  validateRequest(UserValidation.LoginZodSchema),
  AuthController.loginUser,
);

router.get(
  "/me",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),
    // validateRequest
  AuthController.getMe,
);

// google login

// router.post("/refresh-token");
// router.post("/google");

// router.post(
//   "/forgot-password",
//   validateRequest(UserValidation.ForgotPasswordZodSchema),
// );

// router.post(
//   "/reset-password",
//   validateRequest(UserValidation.ResetPasswordZodSchema),
// );

export const AuthRoutes = router;
