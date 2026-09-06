import { z } from "zod";

export const createInvitationValidationSchema = z.object({
  assessmentId: z
    .string()
    .uuid("Invalid assessment ID"),

  candidateId: z
    .string()
    .uuid("Invalid candidate ID"),

  userId: z
    .string()
    .uuid("Invalid user ID"),

  email: z
    .string()
    .email("Invalid email address"),

  expiresAt: z
    .coerce
    .date()
    .refine(
      (date) => date > new Date(),
      "Expiration date must be in the future",
    )
    .optional(),
});