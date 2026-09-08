import { z } from "zod";
export declare const createCompanyValidationSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    companyName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCompanyValidationSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=company.validation.d.ts.map