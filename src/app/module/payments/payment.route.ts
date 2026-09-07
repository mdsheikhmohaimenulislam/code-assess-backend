import { Router } from "express";

import { Role } from "../../../generated/prisma/enums.js";

import { PaymentController } from "./payment.controller.js";
import { auth } from "../../middlewares/checkAuth.js";

const router = Router();

// Create bKash payment
router.post(
  "/:assessmentId",
  auth(Role.CANDIDATE),
  PaymentController.createPayment,
);

// Execute bKash payment
router.get(
  "/execute/:id",
  auth(Role.CANDIDATE),
  PaymentController.executePayment,
);







export const PaymentRoutes = router;