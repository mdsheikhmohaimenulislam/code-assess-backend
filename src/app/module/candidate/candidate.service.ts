import { Role, UserStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	CreateCandidatePayload,
	UpdateCandidatePayload,
} from "./candidate.interface.js";
import httpStatus from "http-status";

const createCandidate = async (
	userId: string,
	payload: CreateCandidatePayload,
) => {
	// Check user
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			status: true,
		},
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	// User must be a candidate
	if (user.role !== Role.CANDIDATE) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Only candidate can create candidate profile",
		);
	}

	// Account must be active
	if (user.status !== UserStatus.ACTIVE) {
		throw new AppError(httpStatus.FORBIDDEN, "Your account is not active");
	}

	// Check existing profile
	const existingProfile = await prisma.candidateProfile.findUnique({
		where: {
			userId,
		},
		select: {
			id: true,
		},
	});

	if (existingProfile) {
		throw new AppError(httpStatus.CONFLICT, "Candidate profile already exists");
	}

	// Create candidate profile
	const candidate = await prisma.candidateProfile.create({
		data: {
			userId,

			...(payload.phone && {
				phone: payload.phone,
			}),

			...(payload.bio && {
				bio: payload.bio,
			}),

			...(payload.githubUrl && {
				githubUrl: payload.githubUrl,
			}),

			...(payload.linkedinUrl && {
				linkedinUrl: payload.linkedinUrl,
			}),

			...(payload.resumeUrl && {
				resumeUrl: payload.resumeUrl,
			}),
		},

		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
		},
	});

	return candidate;
};

const getMyCandidate = async (userId: string) => {
	const candidate = await prisma.candidateProfile.findUnique({
		where: {
			userId,
		},

		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					status: true,
				},
			},

			_count: {
				select: {
					invitations: true,
					attempts: true,
				},
			},
		},
	});

	if (!candidate) {
		throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
	}

	return candidate;
};

const getCandidateById = async (candidateId: string) => {
	const candidate = await prisma.candidateProfile.findUnique({
		where: {
			id: candidateId,
		},

		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					status: true,
				},
			},

			_count: {
				select: {
					invitations: true,
					attempts: true,
				},
			},
		},
	});

	if (!candidate) {
		throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
	}

	return candidate;
};

const updateCandidate = async (
	userId: string,
	candidateId: string,
	payload: UpdateCandidatePayload,
) => {
	/**
	 * Find candidate profile
	 */
	const candidate = await prisma.candidateProfile.findUnique({
		where: {
			id: candidateId,
		},
		select: {
			id: true,
			userId: true,
		},
	});

	if (!candidate) {
		throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
	}

	/**
	 * Ownership check
	 */
	if (candidate.userId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to update this profile",
		);
	}

	/**
	 * Update candidate profile
	 */
	const updatedCandidate = await prisma.candidateProfile.update({
		where: {
			id: candidateId,
		},

		data: {
			...(payload.phone !== undefined && {
				phone: payload.phone,
			}),

			...(payload.bio !== undefined && {
				bio: payload.bio,
			}),

			...(payload.githubUrl !== undefined && {
				githubUrl: payload.githubUrl,
			}),

			...(payload.linkedinUrl !== undefined && {
				linkedinUrl: payload.linkedinUrl,
			}),

			...(payload.resumeUrl !== undefined && {
				resumeUrl: payload.resumeUrl,
			}),
		},

		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					status: true,
				},
			},
		},
	});

	return updatedCandidate;
};

const deleteCandidate = async (userId: string, candidateId: string) => {
	/**
	 * Find candidate profile
	 */
	const candidate = await prisma.candidateProfile.findUnique({
		where: {
			id: candidateId,
		},
		select: {
			id: true,
			userId: true,
		},
	});

	if (!candidate) {
		throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
	}

	/**
	 * Ownership check
	 */
	if (candidate.userId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to delete this profile",
		);
	}

	/**
	 * Delete candidate profile
	 */
	await prisma.candidateProfile.delete({
		where: {
			id: candidateId,
		},
	});

	return {
		id: candidateId,
		deleted: true,
	};
};

export const CandidateService = {
	createCandidate,
	getMyCandidate,
	getCandidateById,
	updateCandidate,
	deleteCandidate,
};
