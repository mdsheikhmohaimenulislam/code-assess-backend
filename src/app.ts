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
