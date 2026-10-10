
import { z } from "zod";

export const createAnswerValidationSchema = z
  .object({
    problemId: z.string().uuid("Invalid problem ID"),

    // MCQ / written answer
    answer: z.string().trim().max(50000).optional(),

    // Coding submission
    language: z
      .enum(["javascript", "typescript", "python", "java", "cpp"])
      .optional(),

    code: z.string().trim().max(50000).optional(),

    startedAt: z.coerce.date().optional(),
    submittedAt: z.coerce.date().optional(),
  })
  .refine(
    (data) => Boolean(data.answer) || Boolean(data.code),
    {
      message: "Answer or code is required",
      path: ["answer"],
    },
  )
  .refine(
    (data) => !data.code || Boolean(data.language),
    {
      message: "Programming language is required",
      path: ["language"],
    },
  );
