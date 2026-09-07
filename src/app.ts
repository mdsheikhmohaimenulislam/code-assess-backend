import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config/index.js";
import { AuthRoutes } from "./app/module/auth/auth.route.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import { notFound } from "./app/middlewares/notFound.js";
import passport from "./app/utils/passport.js";
import { userRoute } from "./app/module/user/user.route.js";
import { problemRoute } from "./app/module/problems/problem.route.js";
import { AssessmentRoutes } from "./app/module/assessment/assessment.route.js";
import { CompanyRoutes } from "./app/module/company/company.route.js";
import { AssessmentProblemRoutes } from "./app/module/AssessmentProblem/assessmentProblem.route.js";
import { InvitationRoutes } from "./app/module/invitation/invitation.route.js";
import { CandidateRoutes } from "./app/module/candidate/candidate.route.js";
import { AttemptRoutes } from "./app/module/attempt/attempt.route.js";
import { TestCaseRoutes } from "./app/module/testCase/testCase.route.js";
import { MCQAnswerRoutes } from "./app/module/MCQOption/mcqAnswer.route.js";
import { AnswerRoutes } from "./app/module/answer/answer.route.js";
import { EvaluationRoutes } from "./app/module/evaluation/evaluation.routes.js";
import { ResultRoutes } from "./app/module/result/result.route.js";
import { PaymentRoutes } from "./app/module/payments/payment.route.js";

const app: Application = express();

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  }),
);

// Enable URL-encoded form data parsing....
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies...
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/problem", problemRoute);
app.use("/api/v1/assessment", AssessmentRoutes);
app.use("/api/v1/company", CompanyRoutes);
app.use("/api/v1/assessment-problem", AssessmentProblemRoutes);
app.use("/api/v1/invitations", InvitationRoutes);
app.use("/api/v1/candidate", CandidateRoutes);
app.use("/api/v1/attempts", AttemptRoutes);
app.use("/api/v1/test-cases", TestCaseRoutes);
app.use("/api/v1/attempts", AnswerRoutes);
app.use("/api/v1/answer", AnswerRoutes);
app.use("/api/v1/evaluations", EvaluationRoutes);
app.use("/api/v1/result/attempts", ResultRoutes);
app.use("/api/v1/payment", PaymentRoutes);
// app.use("/api/v1/mcq-answers", MCQAnswerRoutes);

// Basic route...
app.get("/", async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to Code Assess System Backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
