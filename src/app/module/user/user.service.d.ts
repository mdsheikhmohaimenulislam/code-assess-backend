import type {
	IGetAllUsersQuery,
	IUpdatedProfile,
	IUserUpdatedProfile,
} from "./user.interface.js";
declare const getSingleUser: (id: string) => Promise<{
	authProvider: import("../../../generated/prisma/enums.js").AuthProvider;
	createdAt: Date;
	email: string;
	emailVerified: boolean;
	id: string;
	imageUrl: string | null;
	name: string;
	role: import("../../../generated/prisma/enums.js").Role;
	status: import("../../../generated/prisma/enums.js").UserStatus;
	updatedAt: Date;
}>;
declare const getAllUsers: (query: IGetAllUsersQuery) => Promise<{
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	data: {
		authProvider: import("../../../generated/prisma/enums.js").AuthProvider;
		createdAt: Date;
		email: string;
		emailVerified: boolean;
		id: string;
		imageUrl: string | null;
		name: string;
		role: import("../../../generated/prisma/enums.js").Role;
		status: import("../../../generated/prisma/enums.js").UserStatus;
		updatedAt: Date;
	}[];
}>;
declare const updateMyProfile: (
	userId: string,
	payload: IUpdatedProfile,
) => Promise<{
	authProvider: import("../../../generated/prisma/enums.js").AuthProvider;
	createdAt: Date;
	email: string;
	emailVerified: boolean;
	id: string;
	imageUrl: string | null;
	name: string;
	role: import("../../../generated/prisma/enums.js").Role;
	status: import("../../../generated/prisma/enums.js").UserStatus;
	updatedAt: Date;
}>;
declare const updateUserStatus: (
	userId: string,
	payload: IUserUpdatedProfile,
) => Promise<{
	authProvider: import("../../../generated/prisma/enums.js").AuthProvider;
	createdAt: Date;
	email: string;
	emailVerified: boolean;
	id: string;
	imageUrl: string | null;
	name: string;
	role: import("../../../generated/prisma/enums.js").Role;
	status: import("../../../generated/prisma/enums.js").UserStatus;
	updatedAt: Date;
}>;
declare const deleteUser: (userId: string) => Promise<null>;
declare const permanentlyDeleteUser: (userId: string) => Promise<null>;
export declare const UserService: {
	getAllUsers: typeof getAllUsers;
	permanentlyDeleteUser: typeof permanentlyDeleteUser;
	updateMyProfile: typeof updateMyProfile;
	getSingleUser: typeof getSingleUser;
	updateUserStatus: typeof updateUserStatus;
	deleteUser: typeof deleteUser;
};
export {};
//# sourceMappingURL=user.service.d.ts.map
