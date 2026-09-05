import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { UserController } from "./user.controller.js";
import { UserValidation } from "./user.validation.js";
import { validateRequest } from "../../middlewares/validateRequst.js";

const route = Router();

route.get(
  "/:id",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),
  UserController.getSingleUser,
);

route.get(
  "/",
  auth(Role.ADMIN),

  UserController.getAllUsers,
);

route.patch(
  "/me/:id",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),
  validateRequest(UserValidation.updateMyProfileSchema),
  UserController.updateMyProfile,
);

route.patch(
  "/status/:id",
  auth(Role.ADMIN),
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateUserStatus,
);

route.delete(
  "/me/:id",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),
  UserController.deleteUser,
);

route.delete("/:id", auth(Role.ADMIN), UserController.permanentlyDeleteUser);

export const userRoute = route;
