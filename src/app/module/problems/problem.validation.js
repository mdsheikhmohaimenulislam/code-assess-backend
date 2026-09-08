import { z } from "zod";
const mcqOptionSchema = z.object({
	text: z.string().trim().min(1, "Option text is required"),
	isCorrect: z.boolean(),
});
export const createProblemValidationSchema = z
	.object({
		title: z
			.string()
			.trim()
			.min(1, "Title is required")
			.max(200, "Title cannot exceed 200 characters"),
		description: z.string().trim().min(1, "Description is required"),
		type: z.enum(["CODING", "MCQ"]),
		difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
		category: z.string().trim().min(1, "Category is required"),
		inputFormat: z.string().trim().optional(),
		outputFormat: z.string().trim().optional(),
		constraints: z.string().trim().optional(),
		timeLimit: z.number().int().positive().optional(),
		memoryLimit: z.number().int().positive().optional(),
		options: z.array(mcqOptionSchema).optional(),
	})
	.superRefine((data, ctx) => {
		// MCQ হলে options অবশ্যই লাগবে
		// if (data.type === "MCQ") {
		//   if (!data.options || data.options.length < 2) {
		//     ctx.addIssue({
		//       code: z.ZodIssueCode.custom,
		//       path: ["options"],
		//       message: "MCQ must have at least 2 options",
		//     });
		//     return;
		//   }
		//   const correctOptions = data.options.filter(
		//     (option) => option.isCorrect,
		//   );
		//   if (correctOptions.length !== 1) {
		//     ctx.addIssue({
		//       code: z.ZodIssueCode.custom,
		//       path: ["options"],
		//       message: "MCQ must have exactly one correct answer",
		//     });
		//   }
		// }
		// Coding হলে options দেওয়া যাবে না
		if (data.type === "CODING" && data.options) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["options"],
				message: "Options are only allowed for MCQ problems",
			});
		}
	});
export const updateProblemValidationSchema = z
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
			.min(10, "Description must be at least 10 characters")
			.optional(),
		type: z.enum(["MCQ", "CODING", "WRITTEN"]).optional(),
		difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
		category: z
			.string()
			.trim()
			.min(2, "Category must be at least 2 characters")
			.max(100, "Category cannot exceed 100 characters")
			.optional(),
		inputFormat: z.string().trim().optional(),
		outputFormat: z.string().trim().optional(),
		constraints: z.string().trim().optional(),
		timeLimit: z
			.number()
			.int()
			.positive("Time limit must be a positive number")
			.max(600000, "Time limit cannot exceed 600000 ms")
			.optional(),
		memoryLimit: z
			.number()
			.int()
			.positive("Memory limit must be a positive number")
			.max(1048576, "Memory limit cannot exceed 1048576 KB")
			.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required to update the problem",
	});
//# sourceMappingURL=problem.validation.js.map
