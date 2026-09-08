import { z } from "zod";

export const createCompanyValidationSchema = z.object({
	userId: z.string().uuid("Invalid user ID").optional(),

	companyName: z
		.string()
		.trim()
		.min(2, "Company name must be at least 2 characters")
		.max(200, "Company name cannot exceed 200 characters"),

	description: z
		.string()
		.trim()
		.max(2000, "Description cannot exceed 2000 characters")
		.optional(),

	website: z.string().url("Invalid website URL").optional(),

	logo: z.string().url("Invalid logo URL").optional(),
});

export const updateCompanyValidationSchema = z
	.object({
		companyName: z
			.string()
			.trim()
			.min(2, "Company name must be at least 2 characters")
			.max(200, "Company name cannot exceed 200 characters")
			.optional(),

		description: z
			.string()
			.trim()
			.max(2000, "Description cannot exceed 2000 characters")
			.optional(),

		website: z.string().trim().url("Invalid website URL").optional(),

		logo: z.string().trim().url("Invalid logo URL").optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required to update company profile",
	});
