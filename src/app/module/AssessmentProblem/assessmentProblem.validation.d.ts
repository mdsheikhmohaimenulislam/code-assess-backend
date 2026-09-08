import { z } from "zod";
export declare const createAssessmentProblemValidationSchema: z.ZodObject<{
    problemId: z.ZodString;
    marks: z.ZodNumber;
    order: z.ZodNumber;
}, z.core.$strip>;
export declare const updateAssessmentProblemValidationSchema: z.ZodObject<{
    marks: z.ZodOptional<z.ZodNumber>;
    order: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=assessmentProblem.validation.d.ts.map