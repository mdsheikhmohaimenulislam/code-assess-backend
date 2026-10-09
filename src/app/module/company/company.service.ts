import {
  Role,
  UserStatus,
  AssessmentStatus,
} from "../../../generated/prisma/enums.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";

import type {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "./company.interface.js";

// -----------------------------------------
// Create company
// -----------------------------------------

const createCompany = async (
  currentUserId: string,
  currentUserRole: Role,
  payload: CreateCompanyPayload,
) => {
  if (!currentUserId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (
    currentUserRole !== Role.ADMIN &&
    currentUserRole !== Role.COMPANY
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to create a company profile",
    );
  }

  const companyName = payload.companyName?.trim();

  if (!companyName) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company name is required",
    );
  }

  if (companyName.length < 2) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company name must be at least 2 characters",
    );
  }

  if (companyName.length > 200) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company name cannot exceed 200 characters",
    );
  }

  const description =
    payload.description?.trim() || null;

  const website =
    payload.website?.trim() || null;

  const logo =
    payload.logo?.trim() || null;

  let profileUserId: string;

  if (currentUserRole === Role.ADMIN) {
    if (!payload.userId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User ID is required when admin creates a company profile",
      );
    }

    profileUserId = payload.userId;
  } else {
    profileUserId = currentUserId;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: profileUserId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isDeleted: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  if (user.role !== Role.COMPANY) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company profile can only be created for a COMPANY user",
    );
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "User account is not active",
    );
  }

  if (user.isDeleted) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  const existingCompany =
    await prisma.companyProfile.findUnique({
      where: {
        userId: profileUserId,
      },

      select: {
        id: true,
      },
    });

  if (existingCompany) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Company profile already exists for this user",
    );
  }

  const existingCompanyName =
    await prisma.companyProfile.findFirst({
      where: {
        companyName: {
          equals: companyName,
          mode: "insensitive",
        },
      },

      select: {
        id: true,
      },
    });

  if (existingCompanyName) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A company with this name already exists",
    );
  }

  const company =
    await prisma.companyProfile.create({
      data: {
        userId: profileUserId,
        companyName,
        description,
        website,
        logo,
      },

      select: {
        id: true,
        userId: true,
        companyName: true,
        description: true,
        website: true,
        logo: true,
        createdAt: true,
        updatedAt: true,

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

  return company;
};

// -----------------------------------------
// Get my company
// -----------------------------------------

const getMyCompany = async (userId: string) => {
  const company =
    await prisma.companyProfile.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,
        userId: true,
        companyName: true,
        description: true,
        website: true,
        logo: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            imageUrl: true,

            _count: {
              select: {
                assessmentsCreated: true,
              },
            },
          },
        },
      },
    });

  if (!company) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Company profile not found",
    );
  }

  return company;
};

// -----------------------------------------
// Get company by ID
// -----------------------------------------

const getCompanyById = async (
  companyId: string,
) => {
  if (!companyId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company ID is required",
    );
  }

  const company =
    await prisma.companyProfile.findUnique({
      where: {
        id: companyId,
      },

      select: {
        id: true,
        userId: true,
        companyName: true,
        description: true,
        website: true,
        logo: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            imageUrl: true,

            assessmentsCreated: {
              where: {
                status: AssessmentStatus.PUBLISHED,
              },

              select: {
                id: true,
                title: true,
                description: true,
                accessType: true,
                price: true,
                status: true,
                createdAt: true,
              },

              orderBy: {
                createdAt: "desc",
              },
            },

            _count: {
              select: {
                assessmentsCreated: true,
              },
            },
          },
        },
      },
    });

  if (!company) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Company profile not found",
    );
  }

  return company;
};

// -----------------------------------------
// Update company
// -----------------------------------------

const updateCompany = async (
  userId: string,
  userRole: Role,
  companyId: string,
  payload: UpdateCompanyPayload,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!companyId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company ID is required",
    );
  }

  const company =
    await prisma.companyProfile.findUnique({
      where: {
        id: companyId,
      },

      select: {
        id: true,
        userId: true,
        companyName: true,
      },
    });

  if (!company) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Company profile not found",
    );
  }

  // COMPANY can update only own profile
  if (
    userRole === Role.COMPANY &&
    company.userId !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own company profile",
    );
  }

  if (payload.companyName !== undefined) {
    const companyName =
      payload.companyName.trim();

    if (!companyName) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Company name cannot be empty",
      );
    }

    if (
      companyName.toLowerCase() !==
      company.companyName.toLowerCase()
    ) {
      const existingCompany =
        await prisma.companyProfile.findFirst({
          where: {
            companyName: {
              equals: companyName,
              mode: "insensitive",
            },

            id: {
              not: companyId,
            },
          },

          select: {
            id: true,
          },
        });

      if (existingCompany) {
        throw new AppError(
          httpStatus.CONFLICT,
          "A company with this name already exists",
        );
      }
    }
  }

  const updatedCompany =
    await prisma.companyProfile.update({
      where: {
        id: companyId,
      },

      data: {
        ...(payload.companyName !== undefined && {
          companyName: payload.companyName.trim(),
        }),

        ...(payload.description !== undefined && {
          description:
            payload.description.trim() || null,
        }),

        ...(payload.website !== undefined && {
          website:
            payload.website.trim() || null,
        }),

        ...(payload.logo !== undefined && {
          logo: payload.logo.trim() || null,
        }),
      },

      select: {
        id: true,
        userId: true,
        companyName: true,
        description: true,
        website: true,
        logo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return updatedCompany;
};

// -----------------------------------------
// Delete company
// -----------------------------------------

const deleteCompany = async (
  userId: string,
  userRole: Role,
  companyId: string,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!companyId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company ID is required",
    );
  }

  const company =
    await prisma.companyProfile.findUnique({
      where: {
        id: companyId,
      },

      select: {
        id: true,
        userId: true,
        companyName: true,
      },
    });

  if (!company) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Company profile not found",
    );
  }

  // COMPANY can delete only own profile
  if (
    userRole === Role.COMPANY &&
    company.userId !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own company profile",
    );
  }

  const deletedCompany =
    await prisma.companyProfile.delete({
      where: {
        id: companyId,
      },

      select: {
        id: true,
        companyName: true,
      },
    });

  return deletedCompany;
};

// -----------------------------------------
// Get all companies
// -----------------------------------------

const getAllCompanies = async () => {
  const companies =
    await prisma.companyProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        userId: true,
        companyName: true,
        description: true,
        website: true,
        logo: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            imageUrl: true,

            _count: {
              select: {
                assessmentsCreated: true,
              },
            },
          },
        },
      },
    });

  return companies;
};

export const CompanyService = {
  createCompany,
  getMyCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getAllCompanies,
};