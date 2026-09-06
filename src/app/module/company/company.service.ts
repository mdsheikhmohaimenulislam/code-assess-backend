import { AssessmentStatus, Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateCompanyPayload } from "./company.interface.js";
import httpStatus from "http-status";

// Create company profile
const createCompany = async (
  currentUserId: string,
  currentUserRole: Role,
  payload: CreateCompanyPayload,
) => {
  // -----------------------------------------
  // 1. Validate current user
  // -----------------------------------------

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

  // -----------------------------------------
  // 2. Validate company name
  // -----------------------------------------

  if (!payload.companyName?.trim()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company name is required",
    );
  }

  const companyName = payload.companyName.trim();

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

  // -----------------------------------------
  // 3. Validate description
  // -----------------------------------------

  const description =
    payload.description?.trim() || null;

  if (description && description.length > 2000) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Description cannot exceed 2000 characters",
    );
  }

  // -----------------------------------------
  // 4. Determine profile owner
  // -----------------------------------------

  let profileUserId: string;

  if (currentUserRole === Role.ADMIN) {
    // ADMIN creates profile for a COMPANY user

    if (!payload.userId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User ID is required when admin creates a company profile",
      );
    }

    profileUserId = payload.userId;
  } else {
    // COMPANY creates only their own profile

    profileUserId = currentUserId;
  }

  // -----------------------------------------
  // 5. Find profile owner
  // -----------------------------------------

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

  // -----------------------------------------
  // 6. User must be COMPANY
  // -----------------------------------------

  if (user.role !== Role.COMPANY) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company profile can only be created for a COMPANY user",
    );
  }

  // -----------------------------------------
  // 7. User must be active
  // -----------------------------------------

  if (user.status !== "ACTIVE") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "User account is not active",
    );
  }

  // -----------------------------------------
  // 8. User must not be deleted
  // -----------------------------------------

  if (user.isDeleted) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  // -----------------------------------------
  // 9. Check existing company profile
  // -----------------------------------------

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

  // -----------------------------------------
  // 10. Check duplicate company name
  // -----------------------------------------

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

  // -----------------------------------------
  // 11. Create company profile
  // -----------------------------------------

  const company =
    await prisma.companyProfile.create({
      data: {
        userId: profileUserId,
        companyName,
        description,
        website:
          payload.website?.trim() || null,
        logo:
          payload.logo?.trim() || null,
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

  return company;
};



// Get own company
const getMyCompany = async (userId: string) => {
  const company = await prisma.companyProfile.findUnique({
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
          assessments: true,
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

// Get company by ID
const getCompanyById = async (companyId: string) => {
  if (!companyId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Company ID is required",
    );
  }

  const company = await prisma.companyProfile.findUnique({
    where: {
      id: companyId,
    },
    select: {
      id: true,
      companyName: true,
      description: true,
      website: true,
      logo: true,
      createdAt: true,
      updatedAt: true,

      assessments: {
        where: {
          status: AssessmentStatus.PUBLISHED,
        },
        select: {
          id: true,
          title: true,
          duration: true,
          totalMarks: true,
          passingMarks: true,
          accessType: true,
          price: true,
          status: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },

      _count: {
        select: {
          assessments: true,
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

// // Update company
// const updateCompany = async (
//   userId: string,
//   companyId: string,
//   payload: UpdateCompanyPayload,
// ) => {

//   const company =
//     await prisma.companyProfile.findUnique({
//       where: {
//         id: companyId,
//       },

//       select: {
//         id: true,
//         userId: true,
//       },
//     });

//   if (!company) {
//     throw new Error(
//       "Company profile not found",
//     );
//   }

//   // Ownership check
//   if (company.userId !== userId) {
//     throw new Error(
//       "You can only update your own company profile",
//     );
//   }

//   const updatedCompany =
//     await prisma.companyProfile.update({
//       where: {
//         id: companyId,
//       },

//       data: {
//         ...(payload.companyName !== undefined && {
//           companyName: payload.companyName,
//         }),

//         ...(payload.description !== undefined && {
//           description: payload.description,
//         }),

//         ...(payload.website !== undefined && {
//           website: payload.website,
//         }),

//         ...(payload.logo !== undefined && {
//           logo: payload.logo,
//         }),
//       },

//       select: {
//         id: true,
//         userId: true,
//         companyName: true,
//         description: true,
//         website: true,
//         logo: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//   return updatedCompany;
// };

// // Delete company
// const deleteCompany = async (
//   userId: string,
//   companyId: string,
// ) => {

//   const company =
//     await prisma.companyProfile.findUnique({
//       where: {
//         id: companyId,
//       },

//       select: {
//         id: true,
//         userId: true,
//       },
//     });

//   if (!company) {
//     throw new Error(
//       "Company profile not found",
//     );
//   }

//   // Ownership check
//   if (company.userId !== userId) {
//     throw new Error(
//       "You can only delete your own company profile",
//     );
//   }

//   const deletedCompany =
//     await prisma.companyProfile.delete({
//       where: {
//         id: companyId,
//       },

//       select: {
//         id: true,
//         companyName: true,
//       },
//     });

//   return deletedCompany;
// };

export const CompanyService = {
  createCompany,
    getMyCompany,
    getCompanyById,
  //   updateCompany,
  //   deleteCompany,
};
