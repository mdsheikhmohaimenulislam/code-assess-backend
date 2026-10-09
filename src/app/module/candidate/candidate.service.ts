import {
  Role,
  UserStatus,
} from "../../../generated/prisma/enums.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";

import type {
  CreateCandidatePayload,
  UpdateCandidatePayload,
} from "./candidate.interface.js";

const getAllCandidate = async () => {
  const candidates =
    await prisma.candidateProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            imageUrl: true,
            emailVerified: true,
            createdAt: true,

            _count: {
              select: {
                results: true,
              },
            },
          },
        },
      },
    });

  return candidates;
};

const createCandidate = async (
  userId: string,
  payload: CreateCandidatePayload,
) => {
  // --------------------------------
  // 1. Find user
  // --------------------------------

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
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  // --------------------------------
  // 2. Check role
  // --------------------------------

  if (user.role !== Role.CANDIDATE) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only candidate can create candidate profile",
    );
  }

  // --------------------------------
  // 3. Check account status
  // --------------------------------

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is not active",
    );
  }

  // --------------------------------
  // 4. Check existing profile
  // --------------------------------

  const existingProfile =
    await prisma.candidateProfile.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,
      },
    });

  if (existingProfile) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Candidate profile already exists",
    );
  }

  // --------------------------------
  // 5. Create profile
  // --------------------------------

  const candidate =
    await prisma.candidateProfile.create({
      data: {
        userId,
        phone: payload.phone,
        bio: payload.bio,
        githubUrl: payload.githubUrl,
        linkedinUrl: payload.linkedinUrl,
        resumeUrl: payload.resumeUrl,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            imageUrl: true,
          },
        },
      },
    });

  return candidate;
};

const getMyCandidate = async (userId: string) => {
  const candidate =
    await prisma.candidateProfile.findUnique({
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
            imageUrl: true,
            emailVerified: true,
            createdAt: true,

            _count: {
              select: {
                results: true,
              },
            },
          },
        },
      },
    });

  if (!candidate) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate profile not found",
    );
  }

  return candidate;
};

const getCandidateById = async (
  candidateId: string,
) => {
  const candidate =
    await prisma.candidateProfile.findUnique({
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
            imageUrl: true,
            emailVerified: true,
            createdAt: true,

            _count: {
              select: {
                results: true,
              },
            },
          },
        },
      },
    });

  if (!candidate) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate profile not found",
    );
  }

  return candidate;
};

const updateCandidate = async (
  userId: string,
  candidateId: string,
  payload: UpdateCandidatePayload,
) => {
  // --------------------------------
  // 1. Find candidate
  // --------------------------------

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

  // --------------------------------
  // 2. Ownership check
  // --------------------------------

  if (candidate.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this profile",
    );
  }

  // --------------------------------
  // 3. Update profile
  // --------------------------------

  const updatedCandidate =
    await prisma.candidateProfile.update({
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
            imageUrl: true,
          },
        },
      },
    });

  return updatedCandidate;
};

const deleteCandidate = async (
  userId: string,
  candidateId: string,
) => {
  // --------------------------------
  // 1. Find candidate
  // --------------------------------

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

  // --------------------------------
  // 2. Ownership check
  // --------------------------------

  if (candidate.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to delete this profile",
    );
  }

  // --------------------------------
  // 3. Delete profile
  // --------------------------------

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
  getAllCandidate,
};