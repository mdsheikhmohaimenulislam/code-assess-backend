import { z } from "zod";
export declare const createAnswerValidationSchema: z.ZodObject<{
    problemId: z.ZodString;
    answer: z.ZodString;
    language: z.ZodEnum<{
        readonly JAVASCRIPT: 'JAVASCRIPT';
        readonly TYPESCRIPT: 'TYPESCRIPT';
        readonly PYTHON: 'PYTHON';
        readonly JAVA: 'JAVA';
        readonly CPP: 'CPP';
    }>;
}, z.core.$strip>;
//# sourceMappingURL=evaluation.validation.d.ts.map