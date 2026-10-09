import { z } from "zod";

export const createAssessmentValidationSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title cannot exceed 200 characters"),

    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),

    accessType: z
      .enum(["FREE", "PAID"])
      .default("FREE"),

    price: z
      .number()
      .positive("Price must be greater than 0")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.accessType === "PAID" &&
      data.price === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Price is required for paid assessment",
      });
    }

    if (
      data.accessType === "FREE" &&
      data.price !== undefined &&
      data.price !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Free assessment cannot have a price",
      });
    }
  });

export const updateAssessmentValidationSchema = z
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
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),

    accessType: z
      .enum(["FREE", "PAID"])
      .optional(),

    price: z
      .number()
      .positive("Price must be greater than 0")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one field is required to update the assessment",
    },
  )
  .superRefine((data, ctx) => {
    if (
      data.accessType === "FREE" &&
      data.price !== undefined &&
      data.price !== null &&
      data.price !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Free assessment cannot have a price",
      });
    }

    if (
      data.accessType === "PAID" &&
      data.price === null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Paid assessment cannot have a null price",
      });
    }
  });