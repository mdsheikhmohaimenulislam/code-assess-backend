import { z } from "zod";

export const createTestCaseValidationSchema = z.object({
	input: z.string().trim().min(1, "Input is required"),

	expectedOutput: z.string().trim().min(1, "Expected output is required"),

	isHidden: z.boolean().optional().default(true),
});

export const updateTestCaseValidationSchema = z
	.object({
		input: z.string().min(1).optional(),
		expectedOutput: z.string().min(1).optional(),
		isHidden: z.boolean().optional(),
	})
	.refine(
		(data) =>
			data.input !== undefined ||
			data.expectedOutput !== undefined ||
			data.isHidden !== undefined,
		{
			message: "At least one field is required to update",
		},
	);
