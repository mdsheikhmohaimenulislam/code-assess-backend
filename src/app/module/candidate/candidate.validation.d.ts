import { z } from "zod";
export declare const createCandidateValidationSchema: z.ZodObject<
	{
		phone: z.ZodOptional<z.ZodString>;
		bio: z.ZodOptional<z.ZodString>;
		githubUrl: z.ZodOptional<z.ZodString>;
		linkedinUrl: z.ZodOptional<z.ZodString>;
		resumeUrl: z.ZodOptional<z.ZodString>;
	},
	z.core.$strip
>;
export declare const updateCandidateValidationSchema: z.ZodObject<
	{
		phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
		bio: z.ZodOptional<z.ZodOptional<z.ZodString>>;
		githubUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
		linkedinUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
		resumeUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
	},
	z.core.$strip
>;
//# sourceMappingURL=candidate.validation.d.ts.map
