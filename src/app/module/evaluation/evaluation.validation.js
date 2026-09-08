import { z } from "zod";
import { ProgrammingLanguage } from "../../../generated/prisma/enums.js";
export const createAnswerValidationSchema = z.object({
    problemId: z.string().uuid("Invalid problem ID"),
    answer: z
        .string()
        .trim()
        .min(1, "Answer is required")
        .max(50000, "Answer is too long"),
    language: z.nativeEnum(ProgrammingLanguage),
});
//# sourceMappingURL=evaluation.validation.js.map