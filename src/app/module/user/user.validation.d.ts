import { z } from "zod";
export declare const UserValidation: {
    userIdSchema: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    updateMyProfileSchema: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    updateUserProfileSchema: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodEnum<{
            ADMIN: "ADMIN";
            CANDIDATE: "CANDIDATE";
            COMPANY: "COMPANY";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            ACTIVE: "ACTIVE";
            BLOCKED: "BLOCKED";
            DELETED: "DELETED";
            INACTIVE: "INACTIVE";
        }>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=user.validation.d.ts.map