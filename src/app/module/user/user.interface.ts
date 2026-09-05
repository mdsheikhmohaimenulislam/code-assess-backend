import type { Role, UserStatus } from "../../../generated/prisma/enums.js";

export interface IGetAllUsersQuery {
  page?: string;
  limit?: string;
  search?: string;
  role?: Role;
  status?: UserStatus
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}