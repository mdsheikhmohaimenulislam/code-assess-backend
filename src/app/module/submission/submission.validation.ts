import { z } from "zod";

export const updateSubmissionValidationSchema = z
  .object({
    obtainedMark: z.number().min(0).optional(),

    status: z
      .enum(["PENDING", "EVALUATED", "FAILED"])
      .optional(),

    isCorrect: z.boolean().nullable().optional(),
  })
  .refine(
    (data) =>
      data.obtainedMark !== undefined ||
      data.status !== undefined ||
      data.isCorrect !== undefined,
    {
      message: "At least one field is required to update",
    },
  );