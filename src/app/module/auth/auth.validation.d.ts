import z from "zod";
export declare const AuthValidation: {
    RegistrationZodSchema: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodEmail;
        password: z.ZodString;
    }, z.core.$strip>;
    LoginZodSchema: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
    }, z.core.$strip>;
    ForgotPasswordZodSchema: z.ZodObject<{
        email: z.ZodEmail;
    }, z.core.$strip>;
    ResetPasswordZodSchema: z.ZodObject<{
        email: z.ZodEmail;
        newPassword: z.ZodString;
        otp: z.ZodString;
    }, z.core.$strip>;
    EmailVerifyZodSchema: z.ZodObject<{
        email: z.ZodEmail;
        otp: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=auth.validation.d.ts.map