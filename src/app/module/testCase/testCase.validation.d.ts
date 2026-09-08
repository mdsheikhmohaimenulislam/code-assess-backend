import { z } from "zod";
export declare const createTestCaseValidationSchema: z.ZodObject<{
    input: z.ZodString;
    expectedOutput: z.ZodString;
    isHidden: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateTestCaseValidationSchema: z.ZodObject<{
    input: z.ZodOptional<z.ZodString>;
    expectedOutput: z.ZodOptional<z.ZodString>;
    isHidden: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
//# sourceMappingURL=testCase.validation.d.ts.map