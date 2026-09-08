import type { Prisma } from "../../../generated/prisma/client.js";
import {
	AssessmentAccessType,
	AssessmentStatus,
	Role,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	ICreateAssessmentPayload,
	UpdateAssessmentPayload,
} from "./assessment.interface.js";
import httpStatus from "http-status";

const createAssessment = async (
	userId: string,
	userRole: Role,
	payload: ICreateAssessmentPayload,
) => {
	// 1. Check user role
	if (userRole !== Role.ADMIN && userRole !== Role.COMPANY) {
		throw new AppError(
			403,
			"You do not have permission to create an assessment",
		);
	}

	// 2. Check required user ID
	if (!userId) {
		throw new AppError(401, "Unauthorized");
	}

	// 3. Check title
	if (!payload.title?.trim()) {
		throw new AppError(400, "Assessment title is required");
	}

	if (payload.title.trim().length < 3) {
		throw new AppError(400, "Assessment title must be at least 3 characters");
	}

	// 4. Check duration
	if (payload.duration === undefined || payload.duration <= 0) {
		throw new AppError(400, "Duration must be greater than 0");
	}

	// 5. Check total marks
	if (payload.totalMarks === undefined || payload.totalMarks <= 0) {
		throw new AppError(400, "Total marks must be greater than 0");
	}

	// 6. Check passing marks
	if (payload.passingMarks === undefined || payload.passingMarks < 0) {
		throw new AppError(400, "Passing marks cannot be negative");
	}

	// 7. Passing marks cannot exceed total marks
	if (payload.passingMarks > payload.totalMarks) {
		throw new AppError(400, "Passing marks cannot be greater than total marks");
	}

	// 8. Check date range
	if (
		payload.startTime &&
		payload.endTime &&
		payload.startTime >= payload.endTime
	) {
		throw new AppError(400, "End time must be greater than start time");
	}

	// 9. Check access type
	const accessType = payload.accessType ?? AssessmentAccessType.FREE;

	if (
		accessType !== AssessmentAccessType.FREE &&
		accessType !== AssessmentAccessType.PAID
	) {
		throw new AppError(400, "Invalid assessment access type");
	}

	// 10. PAID assessment must have price
	if (
		accessType === AssessmentAccessType.PAID &&
		(payload.price === undefined || payload.price <= 0)
	) {
		throw new AppError(400, "Price is required for paid assessment");
	}

	// 11. FREE assessment cannot have price
	if (
		accessType === AssessmentAccessType.FREE &&
		payload.price !== undefined &&
		payload.price !== 0
	) {
		throw new AppError(400, "Free assessment cannot have a price");
	}

	// 12. Check company ID
	if (!payload.companyId) {
		throw new AppError(400, "Company ID is required");
	}

	// 13. Check company exists
	const company = await prisma.companyProfile.findUnique({
		where: {
			id: payload.companyId,
		},
		select: {
			id: true,
			companyName: true,
			userId: true,
		},
	});

	if (!company) {
		throw new AppError(404, "Company not found");
	}

	// 14. COMPANY can create only for own company
	if (userRole === Role.COMPANY && company.userId !== userId) {
		throw new AppError(
			403,
			"You can only create an assessment for your own company",
		);
	}

	// 15. Create assessment
	const assessment = await prisma.assessment.create({
		data: {
			title: payload.title.trim(),
			description: payload.description?.trim() ?? null,

			duration: payload.duration,

			startTime: payload.startTime ?? null,
			endTime: payload.endTime ?? null,

			totalMarks: payload.totalMarks,
			passingMarks: payload.passingMarks,

			accessType,

			price: accessType === AssessmentAccessType.PAID ? payload.price! : null,

			companyId: payload.companyId,
			createdById: userId,
		},

		select: {
			id: true,
			title: true,
			description: true,
			duration: true,
			startTime: true,
			endTime: true,
			totalMarks: true,
			passingMarks: true,
			accessType: true,
			price: true,
			status: true,
			companyId: true,
			createdById: true,
			createdAt: true,
			updatedAt: true,

			company: {
				select: {
					id: true,
					companyName: true,
				},
			},
		},
	});

	return assessment;
};

//   Get All Assessments
const getAssessments = async (query: Record<string, unknown>) => {
	const page = Math.max(Number(query.page) || 1, 1);

	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

	const skip = (page - 1) * limit;

	const search =
		typeof query.search === "string" ? query.search.trim() : undefined;

	const status =
		typeof query.status === "string"
			? query.status.trim().toUpperCase()
			: undefined;

	const accessType =
		typeof query.accessType === "string"
			? query.accessType.trim().toUpperCase()
			: undefined;

	const companyId =
		typeof query.companyId === "string" ? query.companyId.trim() : undefined;

	// Validate status
	if (
		status &&
		!Object.values(AssessmentStatus).includes(status as AssessmentStatus)
	) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid assessment status");
	}

	// Validate access type
	if (
		accessType &&
		!Object.values(AssessmentAccessType).includes(
			accessType as AssessmentAccessType,
		)
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Invalid assessment access type",
		);
	}

	// Validate company ID
	if (companyId) {
		const company = await prisma.companyProfile.findUnique({
			where: {
				id: companyId,
			},
			select: {
				id: true,
			},
		});

		if (!company) {
			throw new AppError(httpStatus.NOT_FOUND, "Company not found");
		}
	}

	const where: Prisma.AssessmentWhereInput = {};

	// Search
	if (search) {
		where.OR = [
			{
				title: {
					contains: search,
					mode: "insensitive",
				},
			},
			{
				description: {
					contains: search,
					mode: "insensitive",
				},
			},
		];
	}

	// Filters
	if (status) {
		where.status = status as AssessmentStatus;
	}

	if (accessType) {
		where.accessType = accessType as AssessmentAccessType;
	}

	if (companyId) {
		where.companyId = companyId;
	}

	// Sorting
	const allowedSortFields = [
		"createdAt",
		"updatedAt",
		"title",
		"duration",
		"totalMarks",
		"passingMarks",
		"startTime",
	] as const;

	type SortField = (typeof allowedSortFields)[number];

	const requestedSort =
		typeof query.sortBy === "string" ? query.sortBy : "createdAt";

	const sortBy: SortField = allowedSortFields.includes(
		requestedSort as SortField,
	)
		? (requestedSort as SortField)
		: "createdAt";

	const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

	const [assessments, total] = await prisma.$transaction([
		prisma.assessment.findMany({
			where,
			skip,
			take: limit,

			orderBy: {
				[sortBy]: sortOrder,
			},

			select: {
				id: true,
				title: true,
				description: true,
				duration: true,
				startTime: true,
				endTime: true,
				totalMarks: true,
				passingMarks: true,
				accessType: true,
				price: true,
				status: true,
				companyId: true,
				createdById: true,
				createdAt: true,
				updatedAt: true,

				company: {
					select: {
						id: true,
						companyName: true,
					},
				},

				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},

				_count: {
					select: {
						problems: true,
						invitations: true,
						attempts: true,
					},
				},
			},
		}),

		prisma.assessment.count({
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
		data: assessments,
	};
};

// Get Single Assessment
const getAssessmentById = async (assessmentId: string) => {
	if (!assessmentId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
	}

	const assessment = await prisma.assessment.findUnique({
		where: {
			id: assessmentId,
		},

		select: {
			id: true,
			title: true,
			description: true,
			duration: true,
			startTime: true,
			endTime: true,
			totalMarks: true,
			passingMarks: true,
			accessType: true,
			price: true,
			status: true,
			companyId: true,
			createdById: true,
			createdAt: true,
			updatedAt: true,

			// Company information
			company: {
				select: {
					id: true,
					companyName: true,
					description: true,
					website: true,
					logo: true,
				},
			},

			// Assessment creator information
			createdBy: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},

			// Assessment problems
			problems: {
				orderBy: {
					order: "asc",
				},

				select: {
					id: true,
					order: true,

					problem: {
						select: {
							id: true,
							title: true,
							description: true,
							type: true,
							difficulty: true,
							category: true,
							inputFormat: true,
							outputFormat: true,
							constraints: true,
							timeLimit: true,
							memoryLimit: true,
						},
					},
				},
			},

			// Related data count
			_count: {
				select: {
					problems: true,
					invitations: true,
					attempts: true,
					payments: true,
				},
			},
		},
	});

	if (!assessment) {
		throw new AppError(httpStatus.NOT_FOUND, "Assessment not found");
	}

	return assessment;
};

// Update Assessment
const updateAssessment = async (
	userId: string,
	userRole: Role,
	assessmentId: string,
	payload: UpdateAssessmentPayload,
) => {
	// Check user
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}

	// Check assessment ID
	if (!assessmentId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
	}

	// Find assessment
	const existingAssessment = await prisma.assessment.findUnique({
		where: {
			id: assessmentId,
		},
		select: {
			id: true,
			createdById: true,
			status: true,
			totalMarks: true,
			passingMarks: true,
			accessType: true,
			price: true,
			startTime: true,
			endTime: true,
		},
	});

	// Assessment not found
	if (!existingAssessment) {
		throw new AppError(httpStatus.NOT_FOUND, "Assessment not found");
	}

	// COMPANY can update only their own assessment
	if (userRole === Role.COMPANY && existingAssessment.createdById !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not have permission to update this assessment",
		);
	}

	// Only DRAFT assessment can be updated
	if (existingAssessment.status !== AssessmentStatus.DRAFT) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Only draft assessment can be updated",
		);
	}

	// Existing value + new value
	const totalMarks = payload.totalMarks ?? existingAssessment.totalMarks;

	const passingMarks = payload.passingMarks ?? existingAssessment.passingMarks;

	const accessType = payload.accessType ?? existingAssessment.accessType;

	// Passing marks validation
	if (passingMarks > totalMarks) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Passing marks cannot be greater than total marks",
		);
	}

	// Date validation
	const startTime = payload.startTime ?? existingAssessment.startTime;

	const endTime = payload.endTime ?? existingAssessment.endTime;

	if (startTime && endTime && startTime >= endTime) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"End time must be greater than start time",
		);
	}

	// Paid assessment validation
	if (accessType === AssessmentAccessType.PAID) {
		const finalPrice =
			payload.price !== undefined ? payload.price : existingAssessment.price;

		if (finalPrice === null || finalPrice === undefined) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Price is required for paid assessment",
			);
		}

		if (Number(finalPrice) <= 0) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Paid assessment price must be greater than 0",
			);
		}
	}

	// Free assessment validation
	if (
		accessType === AssessmentAccessType.FREE &&
		payload.price !== undefined &&
		payload.price !== null &&
		payload.price !== 0
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Free assessment cannot have a price",
		);
	}

	// Update assessment
	const updatedAssessment = await prisma.assessment.update({
		where: {
			id: assessmentId,
		},

		data: {
			...(payload.title !== undefined && {
				title: payload.title.trim(),
			}),

			...(payload.description !== undefined && {
				description: payload.description.trim(),
			}),

			...(payload.duration !== undefined && {
				duration: payload.duration,
			}),

			...(payload.startTime !== undefined && {
				startTime: payload.startTime,
			}),

			...(payload.endTime !== undefined && {
				endTime: payload.endTime,
			}),

			...(payload.totalMarks !== undefined && {
				totalMarks: payload.totalMarks,
			}),

			...(payload.passingMarks !== undefined && {
				passingMarks: payload.passingMarks,
			}),

			...(payload.accessType !== undefined && {
				accessType: payload.accessType,
			}),

			...(payload.price !== undefined && {
				price: accessType === AssessmentAccessType.FREE ? null : payload.price,
			}),
		},
	});

	return updatedAssessment;
};

//  Delete Assessment

const deleteAssessment = async (
	userId: string,
	userRole: Role,
	assessmentId: string,
) => {
	// Check user
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}

	// Check assessment ID
	if (!assessmentId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
	}

	// Find assessment
	const existingAssessment = await prisma.assessment.findUnique({
		where: {
			id: assessmentId,
		},
		select: {
			id: true,
			title: true,
			createdById: true,
			status: true,
		},
	});

	// Assessment not found
	if (!existingAssessment) {
		throw new AppError(httpStatus.NOT_FOUND, "Assessment not found");
	}

	// COMPANY can delete only their own assessment
	if (userRole === Role.COMPANY && existingAssessment.createdById !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not have permission to delete this assessment",
		);
	}

	// Only draft assessment can be deleted
	if (existingAssessment.status !== AssessmentStatus.DRAFT) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Only draft assessment can be deleted",
		);
	}

	// Delete assessment
	const deletedAssessment = await prisma.assessment.delete({
		where: {
			id: assessmentId,
		},
		select: {
			id: true,
			title: true,
		},
	});

	return deletedAssessment;
};

const updateAssessmentStatus = async (
	userId: string,
	userRole: Role,
	assessmentId: string,
	status: AssessmentStatus,
) => {
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}

	if (!assessmentId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Assessment ID is required");
	}

	const assessment = await prisma.assessment.findUnique({
		where: {
			id: assessmentId,
		},
		select: {
			id: true,
			title: true,
			createdById: true,
			status: true,
			accessType: true,
			price: true,
		},
	});

	if (!assessment) {
		throw new AppError(httpStatus.NOT_FOUND, "Assessment not found");
	}

	// COMPANY can manage only own assessment
	if (userRole === Role.COMPANY && assessment.createdById !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not have permission to manage this assessment",
		);
	}

	// Publish
	if (status === AssessmentStatus.PUBLISHED) {
		if (assessment.status !== AssessmentStatus.DRAFT) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Only draft assessment can be published",
			);
		}

		const problemCount = await prisma.assessmentProblem.count({
			where: {
				assessmentId,
			},
		});

		if (problemCount === 0) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Assessment must contain at least one problem",
			);
		}

		if (
			assessment.accessType === AssessmentAccessType.PAID &&
			(!assessment.price || Number(assessment.price) <= 0)
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Paid assessment must have a valid price",
			);
		}
	}

	// Cancel
	if (status === AssessmentStatus.CANCELLED) {
		if (
			assessment.status === AssessmentStatus.COMPLETED ||
			assessment.status === AssessmentStatus.CANCELLED
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"This assessment cannot be cancelled",
			);
		}
	}

	// Complete
	if (status === AssessmentStatus.COMPLETED) {
		if (assessment.status !== AssessmentStatus.ONGOING) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Only ongoing assessment can be completed",
			);
		}
	}

	const updatedAssessment = await prisma.assessment.update({
		where: {
			id: assessmentId,
		},
		data: {
			status,
		},
	});

	return updatedAssessment;
};

export const AssessmentService = {
	createAssessment,
	getAssessments,
	getAssessmentById,
	updateAssessment,
	deleteAssessment,
	updateAssessmentStatus,
};
