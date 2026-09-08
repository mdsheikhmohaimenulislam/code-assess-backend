import { z } from "zod";
export declare const createProblemValidationSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<{
        CODING: "CODING";
        MCQ: "MCQ";
    }>;
    difficulty: z.ZodOptional<z.ZodEnum<{
        EASY: "EASY";
        HARD: "HARD";
        MEDIUM: "MEDIUM";
    }>>;
    category: z.ZodString;
    inputFormat: z.ZodOptional<z.ZodString>;
    outputFormat: z.ZodOptional<z.ZodString>;
    constraints: z.ZodOptional<z.ZodString>;
    timeLimit: z.ZodOptional<z.ZodNumber>;
    memoryLimit: z.ZodOptional<z.ZodNumber>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        isCorrect: z.ZodBoolean;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateProblemValidationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        CODING: "CODING";
        MCQ: "MCQ";
        WRITTEN: "WRITTEN";
    }>>;
    difficulty: z.ZodOptional<z.ZodEnum<{
        EASY: "EASY";
        HARD: "HARD";
        MEDIUM: "MEDIUM";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    inputFormat: z.ZodOptional<z.ZodString>;
    outputFormat: z.ZodOptional<z.ZodString>;
    constraints: z.ZodOptional<z.ZodString>;
    timeLimit: z.ZodOptional<z.ZodNumber>;
    memoryLimit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=problem.validation.d.ts.map