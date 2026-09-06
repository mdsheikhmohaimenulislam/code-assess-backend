import { AssessmentAccessType, Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { ICreateAssessmentPayload } from "./assessment.interface.js";




const createAssessment = async (
  userId: string,
  userRole: Role,
  payload: ICreateAssessmentPayload,
) => {
  // 1. Check user role
  if (
    userRole !== Role.ADMIN &&
    userRole !== Role.COMPANY
  ) {
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
    throw new AppError(
      400,
      "Assessment title is required",
    );
  }

  if (payload.title.trim().length < 3) {
    throw new AppError(
      400,
      "Assessment title must be at least 3 characters",
    );
  }

  // 4. Check duration
  if (
    payload.duration === undefined ||
    payload.duration <= 0
  ) {
    throw new AppError(
      400,
      "Duration must be greater than 0",
    );
  }

  // 5. Check total marks
  if (
    payload.totalMarks === undefined ||
    payload.totalMarks <= 0
  ) {
    throw new AppError(
      400,
      "Total marks must be greater than 0",
    );
  }

  // 6. Check passing marks
  if (
    payload.passingMarks === undefined ||
    payload.passingMarks < 0
  ) {
    throw new AppError(
      400,
      "Passing marks cannot be negative",
    );
  }

  // 7. Passing marks cannot exceed total marks
  if (payload.passingMarks > payload.totalMarks) {
    throw new AppError(
      400,
      "Passing marks cannot be greater than total marks",
    );
  }

  // 8. Check date range
  if (
    payload.startTime &&
    payload.endTime &&
    payload.startTime >= payload.endTime
  ) {
    throw new AppError(
      400,
      "End time must be greater than start time",
    );
  }

  // 9. Check access type
  const accessType =
    payload.accessType ?? AssessmentAccessType.FREE;

  if (
    accessType !== AssessmentAccessType.FREE &&
    accessType !== AssessmentAccessType.PAID
  ) {
    throw new AppError(
      400,
      "Invalid assessment access type",
    );
  }

  // 10. PAID assessment must have price
  if (
    accessType === AssessmentAccessType.PAID &&
    (payload.price === undefined || payload.price <= 0)
  ) {
    throw new AppError(
      400,
      "Price is required for paid assessment",
    );
  }

  // 11. FREE assessment cannot have price
  if (
    accessType === AssessmentAccessType.FREE &&
    payload.price !== undefined &&
    payload.price !== 0
  ) {
    throw new AppError(
      400,
      "Free assessment cannot have a price",
    );
  }

  // 12. Check company ID
  if (!payload.companyId) {
    throw new AppError(
      400,
      "Company ID is required",
    );
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
    throw new AppError(
      404,
      "Company not found",
    );
  }

  // 14. COMPANY can create only for own company
  if (
    userRole === Role.COMPANY &&
    company.userId !== userId
  ) {
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

      price:
        accessType === AssessmentAccessType.PAID
          ? payload.price!
          : null,

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

/**
 * Get All Assessments
 *
 * Supports:
 * ?page=1
 * ?limit=10
 * ?search=javascript
 * ?status=PUBLISHED
 * ?accessType=PAID
 * ?companyId=xxx
 * ?sortBy=createdAt
 * ?sortOrder=desc
 */
// const getAssessments = async (query: Record<string, unknown>) => {
//   const page = Math.max(Number(query.page) || 1, 1);

//   const limit = Math.min(
//     Math.max(Number(query.limit) || 10, 1),
//     100,
//   );

//   const skip = (page - 1) * limit;

//   const search =
//     typeof query.search === "string"
//       ? query.search.trim()
//       : undefined;

//   const status =
//     typeof query.status === "string"
//       ? query.status
//       : undefined;

//   const accessType =
//     typeof query.accessType === "string"
//       ? query.accessType
//       : undefined;

//   const companyId =
//     typeof query.companyId === "string"
//       ? query.companyId
//       : undefined;

//   const allowedSortFields = [
//     "createdAt",
//     "updatedAt",
//     "title",
//     "duration",
//     "totalMarks",
//     "passingMarks",
//     "startTime",
//   ] as const;

//   type SortField =
//     (typeof allowedSortFields)[number];

//   const requestedSort =
//     typeof query.sortBy === "string"
//       ? query.sortBy
//       : "createdAt";

//   const sortBy: SortField =
//     allowedSortFields.includes(
//       requestedSort as SortField,
//     )
//       ? (requestedSort as SortField)
//       : "createdAt";

//   const sortOrder =
//     query.sortOrder === "asc"
//       ? "asc"
//       : "desc";

//   const where: Prisma.AssessmentWhereInput = {};

//   // Search
//   if (search) {
//     where.OR = [
//       {
//         title: {
//           contains: search,
//           mode: "insensitive",
//         },
//       },
//       {
//         description: {
//           contains: search,
//           mode: "insensitive",
//         },
//       },
//     ];
//   }

//   // Status filter
//   if (status) {
//     if (
//       Object.values(AssessmentStatus).includes(
//         status as AssessmentStatus,
//       )
//     ) {
//       where.status = status as AssessmentStatus;
//     }
//   }

//   // Access type filter
//   if (accessType) {
//     if (
//       Object.values(AssessmentAccessType).includes(
//         accessType as AssessmentAccessType,
//       )
//     ) {
//       where.accessType =
//         accessType as AssessmentAccessType;
//     }
//   }

//   // Company filter
//   if (companyId) {
//     where.companyId = companyId;
//   }

//   const [assessments, total] =
//     await prisma.$transaction([
//       prisma.assessment.findMany({
//         where,
//         skip,
//         take: limit,

//         orderBy: {
//           [sortBy]: sortOrder,
//         },

//         select: {
//           id: true,
//           title: true,
//           description: true,
//           duration: true,
//           startTime: true,
//           endTime: true,
//           totalMarks: true,
//           passingMarks: true,
//           accessType: true,
//           price: true,
//           status: true,
//           companyId: true,
//           createdById: true,
//           createdAt: true,
//           updatedAt: true,

//           company: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },

//           createdBy: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//             },
//           },

//           _count: {
//             select: {
//               problems: true,
//               invitations: true,
//               attempts: true,
//             },
//           },
//         },
//       }),

//       prisma.assessment.count({
//         where,
//       }),
//     ]);

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },

//     data: assessments,
//   };
// };

/**
 * Get Single Assessment
 */
// const getAssessmentById = async (
//   assessmentId: string,
// ) => {
//   const assessment =
//     await prisma.assessment.findUnique({
//       where: {
//         id: assessmentId,
//       },

//       include: {
//         company: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },

//         createdBy: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },

//         problems: {
//           orderBy: {
//             order: "asc",
//           },

//           include: {
//             problem: true,
//           },
//         },

//         _count: {
//           select: {
//             invitations: true,
//             attempts: true,
//             payments: true,
//           },
//         },
//       },
//     });

//   if (!assessment) {
//     throw new Error("Assessment not found");
//   }

//   return assessment;
// };

/**
 * Update Assessment
 */
// const updateAssessment = async (
//   userId: string,
//   userRole: Role,
//   assessmentId: string,
//   payload: UpdateAssessmentPayload,
// ) => {
//   const existingAssessment =
//     await checkAssessmentOwnership(
//       assessmentId,
//       userId,
//       userRole,
//     );

//   // Only DRAFT assessment should be freely editable
//   if (
//     existingAssessment.status !==
//     AssessmentStatus.DRAFT
//   ) {
//     throw new Error(
//       "Only draft assessment can be updated",
//     );
//   }

//   const totalMarks =
//     payload.totalMarks ??
//     (
//       await prisma.assessment.findUnique({
//         where: {
//           id: assessmentId,
//         },
//         select: {
//           totalMarks: true,
//         },
//       })
//     )?.totalMarks;

//   const passingMarks =
//     payload.passingMarks ??
//     (
//       await prisma.assessment.findUnique({
//         where: {
//           id: assessmentId,
//         },
//         select: {
//           passingMarks: true,
//         },
//       })
//     )?.passingMarks;

//   if (
//     totalMarks !== undefined &&
//     passingMarks !== undefined &&
//     passingMarks > totalMarks
//   ) {
//     throw new Error(
//       "Passing marks cannot be greater than total marks",
//     );
//   }

//   // Validate paid/free logic
//   const accessType =
//     payload.accessType ??
//     (
//       await prisma.assessment.findUnique({
//         where: {
//           id: assessmentId,
//         },
//         select: {
//           accessType: true,
//         },
//       })
//     )?.accessType;

//   if (
//     accessType === AssessmentAccessType.PAID
//   ) {
//     if (
//       payload.price === undefined &&
//       (
//         await prisma.assessment.findUnique({
//           where: {
//             id: assessmentId,
//           },
//           select: {
//             price: true,
//           },
//         })
//       )?.price === null
//     ) {
//       throw new Error(
//         "Price is required for paid assessment",
//       );
//     }

//     if (
//       payload.price !== undefined &&
//       payload.price !== null &&
//       payload.price <= 0
//     ) {
//       throw new Error(
//         "Paid assessment price must be greater than 0",
//       );
//     }
//   }

//   if (
//     accessType === AssessmentAccessType.FREE &&
//     payload.price !== undefined &&
//     payload.price !== null &&
//     payload.price !== 0
//   ) {
//     throw new Error(
//       "Free assessment cannot have a price",
//     );
//   }

//   if (
//     payload.startTime &&
//     payload.endTime &&
//     payload.startTime >= payload.endTime
//   ) {
//     throw new Error(
//       "End time must be greater than start time",
//     );
//   }

//   const updatedAssessment =
//     await prisma.assessment.update({
//       where: {
//         id: assessmentId,
//       },

//       data: {
//         ...(payload.title !== undefined && {
//           title: payload.title,
//         }),

//         ...(payload.description !== undefined && {
//           description: payload.description,
//         }),

//         ...(payload.duration !== undefined && {
//           duration: payload.duration,
//         }),

//         ...(payload.startTime !== undefined && {
//           startTime: payload.startTime,
//         }),

//         ...(payload.endTime !== undefined && {
//           endTime: payload.endTime,
//         }),

//         ...(payload.totalMarks !== undefined && {
//           totalMarks: payload.totalMarks,
//         }),

//         ...(payload.passingMarks !== undefined && {
//           passingMarks: payload.passingMarks,
//         }),

//         ...(payload.accessType !== undefined && {
//           accessType: payload.accessType,
//         }),

//         ...(payload.price !== undefined && {
//           price:
//             payload.accessType ===
//               AssessmentAccessType.FREE
//               ? null
//               : payload.price,
//         }),
//       },
//     });

//   return updatedAssessment;
// };

/**
 * Delete Assessment
 */
// const deleteAssessment = async (
//   userId: string,
//   userRole: Role,
//   assessmentId: string,
// ) => {
//   const existingAssessment =
//     await checkAssessmentOwnership(
//       assessmentId,
//       userId,
//       userRole,
//     );

//   // Do not delete active assessment
//   if (
//     existingAssessment.status !==
//     AssessmentStatus.DRAFT
//   ) {
//     throw new Error(
//       "Only draft assessment can be deleted",
//     );
//   }

//   const deletedAssessment =
//     await prisma.assessment.delete({
//       where: {
//         id: assessmentId,
//       },

//       select: {
//         id: true,
//         title: true,
//       },
//     });

//   return deletedAssessment;
// };

/**
 * Publish Assessment
 */
// const publishAssessment = async (
//   userId: string,
//   userRole: Role,
//   assessmentId: string,
// ) => {
//   const assessment =
//     await checkAssessmentOwnership(
//       assessmentId,
//       userId,
//       userRole,
//     );

//   if (
//     assessment.status !==
//     AssessmentStatus.DRAFT
//   ) {
//     throw new Error(
//       "Only draft assessment can be published",
//     );
//   }

//   // Assessment must have at least one problem
//   const problemCount =
//     await prisma.assessmentProblem.count({
//       where: {
//         assessmentId,
//       },
//     });

//   if (problemCount === 0) {
//     throw new Error(
//       "Assessment must contain at least one problem",
//     );
//   }

//   // Paid assessment must have price
//   const fullAssessment =
//     await prisma.assessment.findUnique({
//       where: {
//         id: assessmentId,
//       },

//       select: {
//         accessType: true,
//         price: true,
//       },
//     });

//   if (
//     fullAssessment?.accessType ===
//       AssessmentAccessType.PAID &&
//     (!fullAssessment.price ||
//       Number(fullAssessment.price) <= 0)
//   ) {
//     throw new Error(
//       "Paid assessment must have a valid price",
//     );
//   }

//   const publishedAssessment =
//     await prisma.assessment.update({
//       where: {
//         id: assessmentId,
//       },

//       data: {
//         status: AssessmentStatus.PUBLISHED,
//       },
//     });

//   return publishedAssessment;
// };

/**
 * Cancel Assessment
 */
// const cancelAssessment = async (
//   userId: string,
//   userRole: Role,
//   assessmentId: string,
// ) => {
//   const assessment =
//     await checkAssessmentOwnership(
//       assessmentId,
//       userId,
//       userRole,
//     );

//   if (
//     assessment.status ===
//       AssessmentStatus.COMPLETED ||
//     assessment.status ===
//       AssessmentStatus.CANCELLED
//   ) {
//     throw new Error(
//       "This assessment cannot be cancelled",
//     );
//   }

//   const cancelledAssessment =
//     await prisma.assessment.update({
//       where: {
//         id: assessmentId,
//       },

//       data: {
//         status: AssessmentStatus.CANCELLED,
//       },
//     });

//   return cancelledAssessment;
// };

/**
 * Complete Assessment
 */
// const completeAssessment = async (
//   userId: string,
//   userRole: Role,
//   assessmentId: string,
// ) => {
//   const assessment =
//     await checkAssessmentOwnership(
//       assessmentId,
//       userId,
//       userRole,
//     );

//   if (
//     assessment.status !==
//     AssessmentStatus.ONGOING
//   ) {
//     throw new Error(
//       "Only ongoing assessment can be completed",
//     );
//   }

//   const completedAssessment =
//     await prisma.assessment.update({
//       where: {
//         id: assessmentId,
//       },

//       data: {
//         status: AssessmentStatus.COMPLETED,
//       },
//     });

//   return completedAssessment;
// };

export const AssessmentService = {
  createAssessment,
//   getAssessments,
//   getAssessmentById,
//   updateAssessment,
//   deleteAssessment,
//   publishAssessment,
//   cancelAssessment,
//   completeAssessment,
};