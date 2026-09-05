import z from "zod";

const RegistrationZodSchema = z.object({
  name: z
    .string("Not A String!!!!!")
    .min(3, "Name must atleast 3 characters long!!!")
    .max(10),
  email: z.email("Not email!!"),
  password: z
    .string()
    .min(8, "Password Must Minimum 8 Characters Long.")
    .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

    .regex(/[0-9]/, "Password must contain atleast 1 Number")
    .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
});

const LoginZodSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Password Must Minimum 8 Characters Long.")
    .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

    .regex(/[0-9]/, "Password must contain atleast 1 Number")
    .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
});


// const getMeResponseSchema = z.object({
//   id: z.string().uuid(),
//   name: z.string(),
//   email: z.string().email(),
//   googleId: z.string().nullable(),
//   role: z.enum(["CANDIDATE", "COMPANY", "ADMIN"]),
//   status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"]),
//   emailVerified: z.boolean(),
//   imageUrl: z.string(),
//   isDeleted: z.boolean(),
//   deletedAt: z.string().datetime().nullable(),
//   createdAt: z.string().datetime(),
//   updatedAt: z.string().datetime(),
// });
// const getMeResponseSchema = z.object({
//   userId: z.string().uuid(),
//   email: z.string().email(),
//   name: z.string().min(1),
//   role: z.enum(Role),
// });


const ForgotPasswordZodSchema = z.object({
  email: z.email(),
});

const ResetPasswordZodSchema = z.object({
  email: z.email(),
  newPassword: z
    .string()
    .min(8, "Password Must Minimum 8 Characters Long.")
    .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

    .regex(/[0-9]/, "Password must contain atleast 1 Number")
    .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
  otp: z.string().length(6),
});

const EmailVerifyZodSchema = z.object({
  email: z.email("Not email!!"),
  otp: z.string().length(6),
});

export const AuthValidation = {
  RegistrationZodSchema,
  LoginZodSchema,
  ForgotPasswordZodSchema,
  ResetPasswordZodSchema,
  EmailVerifyZodSchema,
  // getMeResponseSchema
};
