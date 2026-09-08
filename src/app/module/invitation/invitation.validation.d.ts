import { z } from "zod";
export declare const createInvitationValidationSchema: z.ZodObject<
	{
		assessmentId: z.ZodString;
		candidateId: z.ZodString;
		userId: z.ZodString;
		email: z.ZodString;
		expiresAt: z.ZodOptional<z.ZodCoercedDate<unknown>>;
	},
	z.core.$strip
>;
//# sourceMappingURL=invitation.validation.d.ts.map
