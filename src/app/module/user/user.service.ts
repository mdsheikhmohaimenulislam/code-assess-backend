import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	IGetAllUsersQuery,
	IUpdatedProfile,
	IUserUpdatedProfile,
} from "./user.interface.js";

const getSingleUser = async (id: string) => {
	const user = await prisma.user.findFirst({
		where: {
			id,
			isDeleted: false,
			deletedAt: null,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			authProvider: true,
			status: true,
			emailVerified: true,
			imageUrl: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	return user;
};
const getAllUsers = async (query: IGetAllUsersQuery) => {
	const page = Math.max(Number(query.page) || 1, 1);

	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

	const skip = (page - 1) * limit;

	const search = query.search?.trim();

	const where: Prisma.UserWhereInput = {
		isDeleted: false,
		deletedAt: null,
	};

	// Search by name or email
	if (search) {
		where.OR = [
			{
				name: {
					contains: search,
					mode: "insensitive",
				},
			},
			{
				email: {
					contains: search,
					mode: "insensitive",
				},
			},
		];
	}

	// Filter by role
	if (query.role) {
		where.role = query.role;
	}

	// Filter by status
	if (query.status) {
		where.status = query.status;
	}

	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";

	const [users, total] = await prisma.$transaction([
		prisma.user.findMany({
			where,
			skip,
			take: limit,

			orderBy: {
				[sortBy]: sortOrder,
			},

			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				authProvider: true,
				status: true,
				emailVerified: true,
				imageUrl: true,
				createdAt: true,
				updatedAt: true,
			},
		}),

		prisma.user.count({
			where,
		}),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: users,
	};
};

const updateMyProfile = async (userId: string, payload: IUpdatedProfile) => {
	const existingUser = await prisma.user.findFirst({
		where: {
			id: userId,
			isDeleted: false,
			deletedAt: null,
		},
	});

	if (!existingUser) {
		throw new AppError(404, "User not found");
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			...(payload.name !== undefined && {
				name: payload.name,
			}),

			...(payload.imageUrl !== undefined && {
				imageUrl: payload.imageUrl,
			}),
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			authProvider: true,
			status: true,
			emailVerified: true,
			imageUrl: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return updatedUser;
};

const updateUserStatus = async (
	userId: string,
	payload: IUserUpdatedProfile,
) => {
	const existingUser = await prisma.user.findFirst({
		where: {
			id: userId,
			isDeleted: false,
			deletedAt: null,
		},
	});

	if (!existingUser) {
		throw new AppError(404, "User not found");
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},

		data: {
			...(payload.name !== undefined && {
				name: payload.name,
			}),

			...(payload.imageUrl !== undefined && {
				imageUrl: payload.imageUrl,
			}),

			...(payload.role !== undefined && {
				role: payload.role,
			}),

			...(payload.status !== undefined && {
				status: payload.status,
			}),
		},

		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			authProvider: true,
			status: true,
			emailVerified: true,
			imageUrl: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return updatedUser;
};

const deleteUser = async (userId: string) => {
	const existingUser = await prisma.user.findFirst({
		where: {
			id: userId,
			isDeleted: false,
			deletedAt: null,
		},
	});

	if (!existingUser) {
		throw new AppError(404, "User not found");
	}

	await prisma.user.update({
		where: {
			id: userId,
		},

		data: {
			isDeleted: true,
			deletedAt: new Date(),
			status: "DELETED",
		},
	});

	return null;
};

const permanentlyDeleteUser = async (userId: string) => {
	const existingUser = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!existingUser) {
		throw new AppError(404, "User not found");
	}

	await prisma.user.delete({
		where: {
			id: userId,
		},
	});

	return null;
};

export const UserService = {
	getAllUsers,
	permanentlyDeleteUser,
	updateMyProfile,
	getSingleUser,
	updateUserStatus,
	deleteUser,
};
