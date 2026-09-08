import { z } from "zod";
export const createCandidateValidationSchema = z.object({
    phone: z
        .string()
        .trim()
        .min(10, "Phone number must be at least 10 characters")
        .max(20, "Phone number cannot exceed 20 characters")
        .optional(),
    bio: z
        .string()
        .trim()
        .max(2000, "Bio cannot exceed 2000 characters")
        .optional(),
    githubUrl: z
        .string()
        .url("Invalid GitHub URL")
        .optional(),
    linkedinUrl: z
        .string()
        .url("Invalid LinkedIn URL")
        .optional(),
    resumeUrl: z
        .string()
        .url("Invalid resume URL")
        .optional(),
});
export const updateCandidateValidationSchema = createCandidateValidationSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update the candidate profile",
});
//# sourceMappingURL=candidate.validation.js.map