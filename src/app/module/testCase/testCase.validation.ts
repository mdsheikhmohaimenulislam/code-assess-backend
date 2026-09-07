import { z } from "zod";

export const createTestCaseValidationSchema = z.object({
  input: z
    .string()
    .trim()
    .min(1, "Input is required"),

  expectedOutput: z
    .string()
    .trim()
    .min(1, "Expected output is required"),

  isHidden: z
    .boolean()
    .optional()
    .default(true),
});