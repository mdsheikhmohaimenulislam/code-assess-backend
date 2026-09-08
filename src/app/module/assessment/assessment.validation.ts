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

		duration: z
			.number()
			.int("Duration must be an integer")
			.positive("Duration must be greater than 0"),

		startTime: z.coerce.date().optional(),

		endTime: z.coerce.date().optional(),

		totalMarks: z.number().positive("Total marks must be greater than 0"),

		passingMarks: z.number().nonnegative("Passing marks cannot be negative"),

		accessType: z.enum(["FREE", "PAID"]).default("FREE"),

		price: z.number().positive("Price must be greater than 0").optional(),

		companyId: z.string().uuid("Invalid company ID"),
	})
	.superRefine((data, ctx) => {
		if (data.passingMarks > data.totalMarks) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["passingMarks"],
				message: "Passing marks cannot be greater than total marks",
			});
		}

		if (data.startTime && data.endTime && data.startTime >= data.endTime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["endTime"],
				message: "End time must be greater than start time",
			});
		}

		if (data.accessType === "PAID" && data.price === undefined) {
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

		duration: z
			.number()
			.int()
			.positive("Duration must be greater than 0")
			.optional(),

		startTime: z.coerce.date().optional(),

		endTime: z.coerce.date().optional(),

		totalMarks: z
			.number()
			.positive("Total marks must be greater than 0")
			.optional(),

		passingMarks: z
			.number()
			.nonnegative("Passing marks cannot be negative")
			.optional(),

		accessType: z.enum(["FREE", "PAID"]).optional(),

		price: z
			.number()
			.positive("Price must be greater than 0")
			.nullable()
			.optional(),
	})

	.superRefine((data, ctx) => {
		// Passing marks cannot be greater than total marks
		if (
			data.totalMarks !== undefined &&
			data.passingMarks !== undefined &&
			data.passingMarks > data.totalMarks
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["passingMarks"],
				message: "Passing marks cannot be greater than total marks",
			});
		}

		// End time must be greater than start time
		if (data.startTime && data.endTime && data.startTime >= data.endTime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["endTime"],
				message: "End time must be greater than start time",
			});
		}

		// Paid assessment must have a valid price
		if (data.accessType === "PAID" && data.price === undefined) {
			// Existing price may already exist in DB,
			// so service layer will handle this case.
		}

		// Free assessment cannot have a positive price
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
	});
