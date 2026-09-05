import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { UserController } from "./user.controller.js";


const route = Router();

route.get(
  "/:id",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),

  UserController.getSingleUser,
);

route.patch(
  "/me",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),
  //   validateRequest(updateMyProfileSchema),
  //   UserController.updateMyProfile,
);

/*
|--------------------------------------------------------------------------
| Admin User Management
|--------------------------------------------------------------------------
*/

route.get(
  "/",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),

  //   UserController.getAllUsers,
);

route.patch(
  "/:id/status",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),
  //   validateRequest(updateUserStatusSchema),
  //   UserController.updateUserStatus,
);

route.patch(
  "/:id/role",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),
  //   validateRequest(updateUserRoleSchema),
  //   UserController.updateUserRole,
);

route.delete(
  "/:id",
  auth(Role.ADMIN, Role.CANDIDATE, Role.COMPANY),
  //   UserController.deleteUser,
);

export const userRoute = route;
