import { z } from "zod";

export const createAttemptValidationSchema = z.object({
	assessmentId: z.string().uuid("Invalid assessment ID"),
});

export const submitAttemptValidationSchema = z.object({});
