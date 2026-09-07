import type { Role } from "../../../generated/prisma/enums.js";

export interface GetAttemptsParams {
  userId: string;
  userRole: Role;
  page: number;
  limit: number;
}

