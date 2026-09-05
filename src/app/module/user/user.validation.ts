import { z } from "zod";

const userIdSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});


export const UserValidation = {
    userIdSchema
}