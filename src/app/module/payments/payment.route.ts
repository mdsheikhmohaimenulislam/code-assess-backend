// import { Router } from "express";
// import { Role } from "../../../generated/prisma/enums.js";
// import { PaymentController } from "./payment.controller.js";
// import { auth } from "../../middlewares/checkAuth.js";
// const router = Router();
// // Create bKash payment
// router.post(
//   "/:assessmentId",
//   auth(Role.CANDIDATE),
//   PaymentController.createPayment,
// );
// // Execute bKash payment
// router.get(
//   "/execute/:id",
//   auth(Role.CANDIDATE),
//   PaymentController.executePayment,
// );

// router.get(
//   "/callback",
//   auth(Role.CANDIDATE),
//   PaymentController.paymentCallback,
// );

// export const paymentRouter = router;
// //# sourceMappingURL=payment.route.js.map


import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";

import { PaymentController } from "./payment.controller.js";
import { auth } from "../../middlewares/checkAuth.js";

const router = Router();

router.post(
  "/:problemId",
  auth(Role.CANDIDATE),
  PaymentController.createPayment,
);

router.get(
  "/execute/:id",
  auth(Role.CANDIDATE),
  PaymentController.executePayment,
);

// bKash callback-এর জন্য auth লাগবে না
router.get(
  "/callback",
  PaymentController.paymentCallback,
);

export const paymentRouter = router;