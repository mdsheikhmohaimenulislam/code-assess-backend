import { z } from "zod";

export const createAssessmentProblemValidationSchema = z.object({
  problemId: z.string().uuid("Invalid problem ID"),

  marks: z
    .number()
    .positive("Marks must be greater than 0"),

  order: z
    .number()
    .int()
    .positive("Order must be greater than 0"),
});

export const updateAssessmentProblemValidationSchema = z
  .object({
    marks: z
      .number()
      .positive("Marks must be greater than 0")
      .optional(),

    order: z
      .number()
      .int()
      .positive("Order must be greater than 0")
      .optional(),
  })
  .refine(
    (data) =>
      data.marks !== undefined ||
      data.order !== undefined,
    {
      message: "At least one field is required",
    },
  );