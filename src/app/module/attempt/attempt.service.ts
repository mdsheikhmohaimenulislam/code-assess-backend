import {
	AssessmentStatus,
	AttemptStatus,
	InvitationStatus,
	Role,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import type { GetAttemptsParams } from "./attempt.interface.js";
import type { Prisma } from "../../../generated/prisma/client.js";

const createAttempt = async (userId: string, assessmentId: string) => {
	// 1. Find candidate profile

	const candidate = await prisma.candidateProfile.findUnique({
		where: {
			userId,
		},

		select: {
			id: true,
			userId: true,
		},
	});

	if (!candidate) {
		throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
	}

	//  2. Find assessment

	const assessment = await prisma.assessment.findUnique({
		where: {
			id: assessmentId,
		},

		select: {
			id: true,
			title: true,
			description: true,
			duration: true,
			totalMarks: true,
			passingMarks: true,
			startTime: true,
			endTime: true,
			status: true,
		},
	});

	if (!assessment) {
		throw new AppError(httpStatus.NOT_FOUND, "Assessment not found");
	}

	// 3. Check assessment status

	if (
		assessment.status !== AssessmentStatus.PUBLISHED &&
		assessment.status !== AssessmentStatus.ONGOING
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This assessment is not available for attempting",
		);
	}

	//  4. Check assessment start time

	const now = new Date();

	if (assessment.startTime && now < assessment.startTime) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Assessment has not started yet",
		);
	}

	//  5. Check assessment end time

	if (assessment.endTime && now > assessment.endTime) {
		throw new AppError(httpStatus.BAD_REQUEST, "Assessment has already ended");
	}

	//  6. Check accepted invitation

	const invitation = await prisma.invitation.findFirst({
		where: {
			assessmentId,
			userId,
			status: InvitationStatus.ACCEPTED,
		},

		select: {
			id: true,
			expiresAt: true,
		},
	});

	if (!invitation) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You must accept the invitation before starting the assessment",
		);
	}

	//  7. Check invitation expiration

	if (invitation.expiresAt && invitation.expiresAt <= now) {
		throw new AppError(httpStatus.BAD_REQUEST, "This invitation has expired");
	}

	// 8. Check existing attempt

	const existingAttempt = await prisma.attempt.findUnique({
		where: {
			assessmentId_candidateId: {
				assessmentId,
				candidateId: candidate.id,
			},
		},

		select: {
			id: true,
			status: true,
			startedAt: true,
			expiresAt: true,
		},
	});

	if (existingAttempt) {
		if (existingAttempt.status === AttemptStatus.IN_PROGRESS) {
			throw new AppError(
				httpStatus.CONFLICT,
				"You already have an active attempt for this assessment",
			);
		}

		throw new AppError(
			httpStatus.CONFLICT,
			"You have already attempted this assessment",
		);
	}

	//  9. Calculate attempt expiration time

	let expiresAt = new Date(now.getTime() + assessment.duration * 60 * 1000);

	//  Assessment endTime is the maximum allowed time

	if (assessment.endTime && expiresAt > assessment.endTime) {
		expiresAt = assessment.endTime;
	}

	// 10. Create attempt

	const attempt = await prisma.attempt.create({
		data: {
			assessmentId,
			userId,
			candidateId: candidate.id,
			status: AttemptStatus.IN_PROGRESS,
			startedAt: now,
			expiresAt,
		},

		select: {
			id: true,
			assessmentId: true,
			userId: true,
			candidateId: true,
			status: true,
			startedAt: true,
			expiresAt: true,
			createdAt: true,

			assessment: {
				select: {
					id: true,
					title: true,
					description: true,
					duration: true,
					totalMarks: true,
					passingMarks: true,
					startTime: true,
					endTime: true,
				},
			},

			candidate: {
				select: {
					id: true,
					userId: true,
				},
			},
		},
	});

	return attempt;
};

const getAttempts = async ({
	userId,
	userRole,
	page,
	limit,
}: GetAttemptsParams) => {
	const skip = (page - 1) * limit;

	let where: Prisma.AttemptWhereInput = {};

	// Candidate শুধু নিজের attempts দেখতে পারবে
	if (userRole === Role.CANDIDATE) {
		const candidate = await prisma.candidateProfile.findUnique({
			where: {
				userId,
			},
			select: {
				id: true,
			},
		});

		if (!candidate) {
			throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
		}

		where = {
			candidateId: candidate.id,
		};
	}

	const [attempts, total] = await prisma.$transaction([
		prisma.attempt.findMany({
			where,
			skip,
			take: limit,
			orderBy: {
				createdAt: "desc",
			},
			include: {
				assessment: {
					select: {
						id: true,
						title: true,
						duration: true,
						totalMarks: true,
						passingMarks: true,
						status: true,
					},
				},
				candidate: {
					select: {
						id: true,
						userId: true,
					},
				},
			},
		}),

		prisma.attempt.count({
			where,
		}),
	]);

	return {
		data: attempts,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

const getAttemptById = async (
	userId: string,
	userRole: Role,
	attemptId: string,
) => {
	const attempt = await prisma.attempt.findUnique({
		where: {
			id: attemptId,
		},
		include: {
			assessment: {
				select: {
					id: true,
					title: true,
					description: true,
					duration: true,
					totalMarks: true,
					passingMarks: true,
					startTime: true,
					endTime: true,
					status: true,
				},
			},
			candidate: {
				select: {
					id: true,
					userId: true,
				},
			},
		},
	});

	if (!attempt) {
		throw new AppError(httpStatus.NOT_FOUND, "Attempt not found");
	}

	if (userRole === Role.CANDIDATE && attempt.candidate.userId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to view this attempt",
		);
	}

	return attempt;
};

const submitAttempt = async (userId: string, attemptId: string) => {
	// 1. Candidate profile
	const candidate = await prisma.candidateProfile.findUnique({
		where: {
			userId,
		},
		select: {
			id: true,
		},
	});

	if (!candidate) {
		throw new AppError(httpStatus.NOT_FOUND, "Candidate profile not found");
	}

	// 2. Find attempt
	const attempt = await prisma.attempt.findUnique({
		where: {
			id: attemptId,
		},
		include: {
			assessment: {
				select: {
					id: true,
					title: true,
					totalMarks: true,
					passingMarks: true,
				},
			},
		},
	});

	if (!attempt) {
		throw new AppError(httpStatus.NOT_FOUND, "Attempt not found");
	}

	// 3. Ownership check
	if (attempt.candidateId !== candidate.id) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to submit this attempt",
		);
	}

	// 4. Already submitted
	if (attempt.status === AttemptStatus.SUBMITTED) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Attempt has already been submitted",
		);
	}

	// 5. Already expired
	if (attempt.status === AttemptStatus.EXPIRED) {
		throw new AppError(httpStatus.BAD_REQUEST, "Attempt has already expired");
	}

	// 6. Attempt must be in progress
	if (attempt.status !== AttemptStatus.IN_PROGRESS) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Only an in-progress attempt can be submitted",
		);
	}

	const now = new Date();

	// 7. Check expiration
	if (attempt.expiresAt && now >= attempt.expiresAt) {
		await prisma.attempt.update({
			where: {
				id: attempt.id,
			},
			data: {
				status: AttemptStatus.EXPIRED,
			},
		});

		throw new AppError(httpStatus.BAD_REQUEST, "Attempt time has expired");
	}

	// 8. Submit attempt
	const submittedAttempt = await prisma.attempt.update({
		where: {
			id: attempt.id,
		},
		data: {
			status: AttemptStatus.SUBMITTED,
			submittedAt: now,
		},
		include: {
			assessment: {
				select: {
					id: true,
					title: true,
					totalMarks: true,
					passingMarks: true,
				},
			},
		},
	});

	return submittedAttempt;
};

export const AttemptService = {
	createAttempt,
	getAttempts,
	getAttemptById,
	submitAttempt,
};
