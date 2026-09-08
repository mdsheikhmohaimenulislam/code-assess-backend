import type { Role, UserStatus } from "../../../generated/prisma/enums.js";

export interface IGetAllUsersQuery {
	page?: string;
	limit?: string;
	search?: string;
	role?: Role;
	status?: UserStatus;
	sortBy?: "createdAt";
	sortOrder?: "asc" | "desc";
}
export interface IUpdatedProfile {
	name?: string;
	imageUrl?: string;
}

export interface IUserUpdatedProfile {
	name?: string;
	imageUrl?: string;
	role?: Role;
	status?: UserStatus;
}
