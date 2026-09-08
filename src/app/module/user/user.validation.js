import { z } from "zod";
import { Role, UserStatus } from "../../../generated/prisma/enums.js";
const userIdSchema = z.object({
    id: z.string().uuid("Invalid user ID"),
});
const updateMyProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
});
const updateUserProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
    role: z.enum(["ADMIN", "CANDIDATE", "COMPANY"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"]).optional(),
});
export const UserValidation = {
    userIdSchema,
    updateMyProfileSchema,
    updateUserProfileSchema,
};
//# sourceMappingURL=user.validation.js.map