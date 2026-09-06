import { AssessmentStatus, Role, UserStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateInvitationPayload } from "./invitation.interface.js";
import httpStatus from "http-status";

const createInvitation = async (
  userId: string,
  userRole: Role,
  payload: CreateInvitationPayload,
) => {
  const {
    assessmentId,
    candidateId,
    userId: candidateUserId,
    email,
    expiresAt,
  } = payload;

  // Check assessment
  const assessment =
    await prisma.assessment.findUnique({
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
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  // ADMIN can manage any assessment
  // COMPANY can manage only own assessment
  if (
    userRole === Role.COMPANY &&
    assessment.company.userId !== userId
  ) {
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
  const candidateUser =
    await prisma.user.findUnique({
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
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate user not found",
    );
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
  const candidate =
    await prisma.candidateProfile.findUnique({
      where: {
        id: candidateId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

  if (!candidate) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate profile not found",
    );
  }

  // Candidate profile must belong to candidate user
  if (candidate.userId !== candidateUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Candidate profile does not belong to this user",
    );
  }

  // Email must match candidate account
  if (
    candidateUser.email.toLowerCase() !==
    email.toLowerCase()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email does not match candidate account",
    );
  }

  // Check duplicate invitation
  const existingInvitation =
    await prisma.invitation.findUnique({
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
  const invitation =
    await prisma.invitation.create({
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

// const getInvitations = async (
//   userId: string,
//   userRole: Role,
//   query: Record<string, unknown>
// ) => {
//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;

//   const skip = (page - 1) * limit;

//   const status = query.status as
//     | "PENDING"
//     | "ACCEPTED"
//     | "REJECTED"
//     | "EXPIRED"
//     | undefined;

//   const where: Prisma.InvitationWhereInput = {};

//   /**
//    * Candidate sees own invitations
//    */
//   if (userRole === Role.CANDIDATE) {
//     where.userId = userId;
//   }

//   /**
//    * COMPANY sees invitations
//    * for its own assessments
//    */
//   if (userRole === Role.COMPANY) {
//     where.assessment = {
//       company: {
//         userId,
//       },
//     };
//   }

//   /**
//    * Filter by status
//    */
//   if (status) {
//     where.status = status;
//   }

//   const [data, total] = await Promise.all([
//     prisma.invitation.findMany({
//       where,
//       skip,
//       take: limit,
//       orderBy: {
//         createdAt: "desc",
//       },
//       include: {
//         assessment: {
//           select: {
//             id: true,
//             title: true,
//             duration: true,
//             startTime: true,
//             endTime: true,
//             status: true,
//           },
//         },
//         candidate: true,
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             status: true,
//           },
//         },
//       },
//     }),

//     prisma.invitation.count({
//       where,
//     }),
//   ]);

//   return {
//     data,
//     meta: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// };

// const getInvitationById = async (
//   userId: string,
//   userRole: Role,
//   invitationId: string
// ) => {
//   const invitation =
//     await prisma.invitation.findUnique({
//       where: {
//         id: invitationId,
//       },
//       include: {
//         assessment: {
//           include: {
//             company: true,
//           },
//         },
//         candidate: true,
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             status: true,
//           },
//         },
//       },
//     });

//   if (!invitation) {
//     throw new ApiError(404, "Invitation not found");
//   }

//   /**
//    * Candidate can only see own invitation
//    */
//   if (
//     userRole === Role.CANDIDATE &&
//     invitation.userId !== userId
//   ) {
//     throw new ApiError(
//       403,
//       "You are not allowed to view this invitation"
//     );
//   }

//   /**
//    * COMPANY can only see own assessment invitations
//    */
//   if (
//     userRole === Role.COMPANY &&
//     invitation.assessment.company.userId !== userId
//   ) {
//     throw new ApiError(
//       403,
//       "You are not allowed to view this invitation"
//     );
//   }

//   return invitation;
// };

// const acceptInvitation = async (
//   userId: string,
//   invitationId: string
// ) => {
//   const invitation =
//     await prisma.invitation.findUnique({
//       where: {
//         id: invitationId,
//       },
//       include: {
//         assessment: true,
//       },
//     });

//   if (!invitation) {
//     throw new ApiError(404, "Invitation not found");
//   }

//   /**
//    * Only invited candidate can accept
//    */
//   if (invitation.userId !== userId) {
//     throw new ApiError(
//       403,
//       "You are not allowed to accept this invitation"
//     );
//   }

//   /**
//    * Check status
//    */
//   if (invitation.status !== "PENDING") {
//     throw new ApiError(
//       400,
//       `Invitation is already ${invitation.status.toLowerCase()}`
//     );
//   }

//   /**
//    * Check expiration
//    */
//   if (
//     invitation.expiresAt &&
//     invitation.expiresAt <= new Date()
//   ) {
//     await prisma.invitation.update({
//       where: {
//         id: invitationId,
//       },
//       data: {
//         status: "EXPIRED",
//       },
//     });

//     throw new ApiError(
//       400,
//       "This invitation has expired"
//     );
//   }

//   /**
//    * Assessment must still be available
//    */
//   if (
//     invitation.assessment.status === "CANCELLED" ||
//     invitation.assessment.status === "COMPLETED"
//   ) {
//     throw new ApiError(
//       400,
//       "This assessment is no longer available"
//     );
//   }

//   /**
//    * Accept
//    */
//   const result = await prisma.invitation.update({
//     where: {
//       id: invitationId,
//     },
//     data: {
//       status: "ACCEPTED",
//     },
//     include: {
//       assessment: {
//         select: {
//           id: true,
//           title: true,
//           duration: true,
//           startTime: true,
//           endTime: true,
//           status: true,
//         },
//       },
//     },
//   });

//   return result;
// };

// const rejectInvitation = async (
//   userId: string,
//   invitationId: string
// ) => {
//   const invitation =
//     await prisma.invitation.findUnique({
//       where: {
//         id: invitationId,
//       },
//     });

//   if (!invitation) {
//     throw new ApiError(404, "Invitation not found");
//   }

//   /**
//    * Only invited candidate can reject
//    */
//   if (invitation.userId !== userId) {
//     throw new ApiError(
//       403,
//       "You are not allowed to reject this invitation"
//     );
//   }

//   /**
//    * Must be pending
//    */
//   if (invitation.status !== "PENDING") {
//     throw new ApiError(
//       400,
//       `Invitation is already ${invitation.status.toLowerCase()}`
//     );
//   }

//   /**
//    * Reject
//    */
//   const result = await prisma.invitation.update({
//     where: {
//       id: invitationId,
//     },
//     data: {
//       status: "REJECTED",
//     },
//   });

//   return result;
// };

// const deleteInvitation = async (
//   userId: string,
//   userRole: Role,
//   invitationId: string
// ) => {
//   const invitation =
//     await prisma.invitation.findUnique({
//       where: {
//         id: invitationId,
//       },
//       include: {
//         assessment: {
//           include: {
//             company: true,
//           },
//         },
//       },
//     });

//   if (!invitation) {
//     throw new ApiError(404, "Invitation not found");
//   }

//   /**
//    * COMPANY can delete only own invitation
//    */
//   if (
//     userRole === Role.COMPANY &&
//     invitation.assessment.company.userId !== userId
//   ) {
//     throw new ApiError(
//       403,
//       "You are not allowed to delete this invitation"
//     );
//   }

//   /**
//    * Only pending invitation can be deleted
//    */
//   if (invitation.status !== "PENDING") {
//     throw new ApiError(
//       400,
//       "Only pending invitations can be deleted"
//     );
//   }

//   await prisma.invitation.delete({
//     where: {
//       id: invitationId,
//     },
//   });

//   return {
//     id: invitationId,
//     deleted: true,
//   };
// };

export const InvitationService = {
  createInvitation,
  //   getInvitations,
  //   getInvitationById,
  //   acceptInvitation,
  //   rejectInvitation,
  //   deleteInvitation,
};
