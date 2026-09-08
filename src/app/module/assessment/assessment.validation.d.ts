import { z } from "zod";
export declare const createAssessmentValidationSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    duration: z.ZodNumber;
    startTime: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    endTime: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    totalMarks: z.ZodNumber;
    passingMarks: z.ZodNumber;
    accessType: z.ZodDefault<z.ZodEnum<{
        FREE: "FREE";
        PAID: "PAID";
    }>>;
    price: z.ZodOptional<z.ZodNumber>;
    companyId: z.ZodString;
}, z.core.$strip>;
export declare const updateAssessmentValidationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    startTime: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    endTime: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    totalMarks: z.ZodOptional<z.ZodNumber>;
    passingMarks: z.ZodOptional<z.ZodNumber>;
    accessType: z.ZodOptional<z.ZodEnum<{
        FREE: "FREE";
        PAID: "PAID";
    }>>;
    price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
//# sourceMappingURL=assessment.validation.d.ts.map