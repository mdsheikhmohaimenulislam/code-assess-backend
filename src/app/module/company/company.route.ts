import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { validateRequest } from "../../middlewares/validateRequst.js";
import {
  createCompanyValidationSchema,
  updateCompanyValidationSchema,
} from "./company.validation.js";
import { CompanyController } from "./company.controller.js";

const router = Router();

// Create company profile
router.post(
  "/",
  auth(Role.COMPANY, Role.ADMIN),
  validateRequest(createCompanyValidationSchema),
  CompanyController.createCompany,
);

// Get own company profile
router.get("/me", auth(Role.COMPANY), CompanyController.getMyCompany);

// Get company by ID
router.get(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY, Role.CANDIDATE),
  CompanyController.getCompanyById,
);

// Update own company profile
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY),
  validateRequest(updateCompanyValidationSchema),
  CompanyController.updateCompany,
);

// Delete own company profile
router.delete(
  "/:id",
  auth(Role.ADMIN, Role.COMPANY),
  CompanyController.deleteCompany,
);

export const CompanyRoutes = router;
