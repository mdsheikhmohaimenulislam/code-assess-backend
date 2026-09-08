import { z } from "zod";

export const createAnswerValidationSchema = z.object({
	problemId: z.string().uuid("Invalid problem ID"),

	answer: z
		.string()
		.trim()
		.min(1, "Answer is required")
		.max(50000, "Answer is too long"),
});
