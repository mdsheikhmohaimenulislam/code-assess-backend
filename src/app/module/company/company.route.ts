import { Router } from "express";

import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequst.js";

import { CompanyController } from "./company.controller.js";
import {
  createCompanyValidationSchema,
  updateCompanyValidationSchema,
} from "./company.validation.js";

const router = Router();

router.post(
  "/",
  auth(Role.COMPANY, Role.ADMIN),
  validateRequest(createCompanyValidationSchema),
  CompanyController.createCompany,
);

router.get(
  "/me",
  auth(Role.COMPANY),
  CompanyController.getMyCompany,
);

router.get(
  "/",
  auth(Role.ADMIN, Role.CANDIDATE),
  CompanyController.getAllCompanies,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  CompanyController.getCompanyById,
);

router.patch(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY),
  validateRequest(updateCompanyValidationSchema),
  CompanyController.updateCompany,
);

router.delete(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY),
  CompanyController.deleteCompany,
);

export const CompanyRoutes = router;