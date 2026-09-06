import { z } from "zod";

export const createProblemValidationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),

  type: z.enum(["MCQ", "CODING", "WRITTEN"]),

  difficulty: z
    .enum(["EASY", "MEDIUM", "HARD"])
    .optional(),

  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters"),

  inputFormat: z
    .string()
    .trim()
    .optional(),

  outputFormat: z
    .string()
    .trim()
    .optional(),

  constraints: z
    .string()
    .trim()
    .optional(),

  timeLimit: z
    .number()
    .int()
    .positive()
    .optional(),

  memoryLimit: z
    .number()
    .int()
    .positive()
    .optional(),
});