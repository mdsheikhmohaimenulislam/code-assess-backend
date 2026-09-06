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

  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),

  category: z.string().trim().min(2, "Category must be at least 2 characters"),

  inputFormat: z.string().trim().optional(),

  outputFormat: z.string().trim().optional(),

  constraints: z.string().trim().optional(),

  timeLimit: z.number().int().positive().optional(),

  memoryLimit: z.number().int().positive().optional(),
});

export const updateProblemValidationSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title cannot exceed 200 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .optional(),

    type: z.enum(["MCQ", "CODING", "WRITTEN"]).optional(),

    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),

    category: z
      .string()
      .trim()
      .min(2, "Category must be at least 2 characters")
      .max(100, "Category cannot exceed 100 characters")
      .optional(),

    inputFormat: z.string().trim().optional(),

    outputFormat: z.string().trim().optional(),

    constraints: z.string().trim().optional(),

    timeLimit: z
      .number()
      .int()
      .positive("Time limit must be a positive number")
      .max(600000, "Time limit cannot exceed 600000 ms")
      .optional(),

    memoryLimit: z
      .number()
      .int()
      .positive("Memory limit must be a positive number")
      .max(1048576, "Memory limit cannot exceed 1048576 KB")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update the problem",
  });
