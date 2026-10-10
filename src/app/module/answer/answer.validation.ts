import { z } from "zod";

export const createAnswerValidationSchema = z
  .object({
    problemId: z.string().uuid("Invalid problem ID"),

    language: z.enum([
      "javascript",
      "typescript",
      "python",
      "java",
      "cpp",
    ]),

    code: z.string().trim().min(1).max(50000),

    startedAt: z.coerce.date(),

    submittedAt: z.coerce.date(),
  })
  .refine((data) => data.startedAt <= data.submittedAt, {
    message: "Start time cannot be after submission time",
    path: ["submittedAt"],
  });