import { z } from "zod";
export const createMCQAnswerValidationSchema = z.object({
    attemptId: z.string().uuid("Invalid attempt ID"),
    problemId: z.string().uuid("Invalid problem ID"),
    selectedOptionId: z.string().uuid("Invalid option ID"),
});
//# sourceMappingURL=mcqAnswer.validation.js.map