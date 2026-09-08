import {
	AssessmentStatus,
	InvitationStatus,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
const createInvitation = async (userId, userRole, payload) => {
	const {
		assessmentId,
		candidateId,
		userId: candidateUserId,
		email,
		expiresAt,
	} = payload;
	// Check assessment
	const assessment = await prisma.assessment.findUnique({
		where: {
			id: assessmentId,
		},
		select: {
			id: true,
			title: true,
			duration: true,
			startTime: true,
			endTime: true,
			status: true,
			company: {
				select: {
					userId: true,
				},
			},
		},
	});
	if (!assessment) {
		throw new AppError(httpStatus.NOT_FOUND, "Assessment not found");
	}
	// ADMIN can manage any assessment
	// COMPANY can manage only own assessment
	if (userRole === Role.COMPANY && assessment.company.userId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to manage this assessment",
		);
	}
	// Assessment must be published or ongoing
	if (
		assessment.status !== AssessmentStatus.PUBLISHED &&
		assessment.status !== AssessmentStatus.ONGOING
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Candidates can only be invited to a published or ongoing assessment",
		);
	}
	// Check candidate user
	const candidateUser = await prisma.user.findUnique({
		where: {
			id: candidateUserId,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			status: true,
		},
	});
	if (!candidateUser) {
		throw new AppError(httpStatus.NOT_FOUND, "Candidate user not found");
	}
	// User must be a candidate
	if (candidateUser.role !== Role.CANDIDATE) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"The selected user is not a candidate",
		);
	}
	// Candidate account must be active
	if (candidateUser.status !== UserStatus.ACTIVE) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Candidate account is not active",
		);
	}
	// Check candidate profile
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
	// Candidate profile must belong to candidate user
	if (candidate.userId !== candidateUserId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Candidate profile does not belong to this user",
		);
	}
	// Email must match candidate account
	if (candidateUser.email.toLowerCase() !== email.toLowerCase()) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Email does not match candidate account",
		);
	}
	// Check duplicate invitation
	const existingInvitation = await prisma.invitation.findUnique({
		where: {
			assessmentId_candidateId: {
				assessmentId,
				candidateId,
			},
		},
		select: {
			id: true,
		},
	});
	if (existingInvitation) {
		throw new AppError(
			httpStatus.CONFLICT,
			"This candidate has already been invited to this assessment",
		);
	}
	// Create invitation
	const invitation = await prisma.invitation.create({
		data: {
			assessmentId,
			candidateId,
			userId: candidateUserId,
			email: candidateUser.email,
			// Dynamic expiration date
			...(expiresAt && { expiresAt }),
		},
		select: {
			id: true,
			assessmentId: true,
			candidateId: true,
			userId: true,
			email: true,
			status: true,
			expiresAt: true,
			createdAt: true,
			assessment: {
				select: {
					id: true,
					title: true,
					duration: true,
					startTime: true,
					endTime: true,
					status: true,
				},
			},
			candidate: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
	return invitation;
};
const getInvitations = async (userId, userRole, query) => {
	/**
	 * Pagination
	 */
	const page = Math.max(Number(query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
	const skip = (page - 1) * limit;
	/**
	 * Status filter
	 */
	const status = query.status;
	const validStatuses = [
		InvitationStatus.PENDING,
		InvitationStatus.ACCEPTED,
		InvitationStatus.REJECTED,
		InvitationStatus.EXPIRED,
	];
	if (
		status !== undefined &&
		(typeof status !== "string" || !validStatuses.includes(status))
	) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid invitation status");
	}
	/**
	 * Base filter
	 */
	const where = {};
	/**
	 * Candidate sees only own invitations
	 */
	if (userRole === Role.CANDIDATE) {
		where.userId = userId;
	}
	/**
	 * Company sees invitations
	 * for its own assessments
	 */
	if (userRole === Role.COMPANY) {
		where.assessment = {
			company: {
				userId,
			},
		};
	}
	/**
	 * Filter by status
	 */
	if (status) {
		where.status = status;
	}
	/**
	 * Get invitations + total count
	 */
	const [data, total] = await Promise.all([
		prisma.invitation.findMany({
			where,
			skip,
			take: limit,
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				assessmentId: true,
				candidateId: true,
				userId: true,
				email: true,
				status: true,
				expiresAt: true,
				createdAt: true,
				updatedAt: true,
				assessment: {
					select: {
						id: true,
						title: true,
						description: true,
						duration: true,
						startTime: true,
						endTime: true,
						status: true,
					},
				},
				candidate: {
					select: {
						id: true,
						userId: true,
						phone: true,
						bio: true,
						githubUrl: true,
						linkedinUrl: true,
						resumeUrl: true,
					},
				},
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
		}),
		prisma.invitation.count({
			where,
		}),
	]);
	return {
		data,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};
const getInvitationById = async (userId, userRole, invitationId) => {
	const invitation = await prisma.invitation.findUnique({
		where: {
			id: invitationId,
		},
		include: {
			assessment: {
				select: {
					id: true,
					title: true,
					description: true,
					duration: true,
					startTime: true,
					endTime: true,
					status: true,
					company: {
						select: {
							id: true,
							userId: true,
							companyName: true,
						},
					},
				},
			},
			candidate: {
				select: {
					id: true,
					userId: true,
					phone: true,
					bio: true,
					githubUrl: true,
					linkedinUrl: true,
					resumeUrl: true,
				},
			},
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
	if (!invitation) {
		throw new AppError(httpStatus.NOT_FOUND, "Invitation not found");
	}
	/**
	 * Candidate can only view own invitation
	 */
	if (userRole === Role.CANDIDATE && invitation.userId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to view this invitation",
		);
	}
	/**
	 * Company can only view invitations
	 * from its own assessments
	 */
	if (
		userRole === Role.COMPANY &&
		invitation.assessment.company.userId !== userId
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to view this invitation",
		);
	}
	return invitation;
};
const acceptInvitation = async (userId, invitationId) => {
	/**
	 * Find invitation
	 */
	const invitation = await prisma.invitation.findUnique({
		where: {
			id: invitationId,
		},
		select: {
			id: true,
			userId: true,
			status: true,
			expiresAt: true,
			assessment: {
				select: {
					id: true,
					title: true,
					duration: true,
					startTime: true,
					endTime: true,
					status: true,
				},
			},
		},
	});
	if (!invitation) {
		throw new AppError(httpStatus.NOT_FOUND, "Invitation not found");
	}
	/**
	 * Only invited candidate can accept
	 */
	if (invitation.userId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to accept this invitation",
		);
	}
	/**
	 * Invitation must be pending
	 */
	if (invitation.status !== InvitationStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Invitation is already ${invitation.status.toLowerCase()}`,
		);
	}
	/**
	 * Check expiration
	 */
	if (invitation.expiresAt && invitation.expiresAt <= new Date()) {
		await prisma.invitation.update({
			where: {
				id: invitationId,
			},
			data: {
				status: InvitationStatus.EXPIRED,
			},
		});
		throw new AppError(httpStatus.BAD_REQUEST, "This invitation has expired");
	}
	/**
	 * Assessment must still be available
	 */
	if (
		invitation.assessment.status === AssessmentStatus.CANCELLED ||
		invitation.assessment.status === AssessmentStatus.COMPLETED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This assessment is no longer available",
		);
	}
	/**
	 * Accept invitation
	 */
	const result = await prisma.invitation.update({
		where: {
			id: invitationId,
		},
		data: {
			status: InvitationStatus.ACCEPTED,
		},
		select: {
			id: true,
			assessmentId: true,
			candidateId: true,
			userId: true,
			email: true,
			status: true,
			expiresAt: true,
			createdAt: true,
			updatedAt: true,
			assessment: {
				select: {
					id: true,
					title: true,
					duration: true,
					startTime: true,
					endTime: true,
					status: true,
				},
			},
		},
	});
	return result;
};
const rejectInvitation = async (userId, invitationId) => {
	/**
	 * Find invitation
	 */
	const invitation = await prisma.invitation.findUnique({
		where: {
			id: invitationId,
		},
		select: {
			id: true,
			userId: true,
			status: true,
		},
	});
	if (!invitation) {
		throw new AppError(httpStatus.NOT_FOUND, "Invitation not found");
	}
	/**
	 * Only invited candidate can reject
	 */
	if (invitation.userId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to reject this invitation",
		);
	}
	/**
	 * Invitation must be pending
	 */
	if (invitation.status !== InvitationStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Invitation is already ${invitation.status.toLowerCase()}`,
		);
	}
	/**
	 * Reject invitation
	 */
	const result = await prisma.invitation.update({
		where: {
			id: invitationId,
		},
		data: {
			status: InvitationStatus.REJECTED,
		},
		select: {
			id: true,
			assessmentId: true,
			candidateId: true,
			userId: true,
			email: true,
			status: true,
			expiresAt: true,
			createdAt: true,
			updatedAt: true,
		},
	});
	return result;
};
const deleteInvitation = async (userId, userRole, invitationId) => {
	const invitation = await prisma.invitation.findUnique({
		where: {
			id: invitationId,
		},
		include: {
			assessment: {
				include: {
					company: true,
				},
			},
		},
	});
	if (!invitation) {
		throw new AppError(httpStatus.NOT_FOUND, "Invitation not found");
	}
	/**
	 * COMPANY can delete only own invitation
	 */
	if (
		userRole === Role.COMPANY &&
		invitation.assessment.company.userId !== userId
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to delete this invitation",
		);
	}
	/**
	 * Only pending invitation can be deleted
	 */
	if (invitation.status !== InvitationStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Only pending invitations can be deleted",
		);
	}
	await prisma.invitation.delete({
		where: {
			id: invitationId,
		},
	});
};
export const InvitationService = {
	createInvitation,
	getInvitations,
	getInvitationById,
	acceptInvitation,
	rejectInvitation,
	deleteInvitation,
};
//# sourceMappingURL=invitation.service.js.map
