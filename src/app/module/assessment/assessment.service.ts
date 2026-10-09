import type { Prisma } from "../../../generated/prisma/client.js";
import {
  AssessmentAccessType,
  AssessmentStatus,
  Role,
} from "../../../generated/prisma/enums.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";

import type {
  ICreateAssessmentPayload,
  IGetAssessmentsQuery,
  IUpdateAssessmentPayload,
} from "./assessment.interface.js";

const createAssessment = async (
  userId: string,
  userRole: Role,
  payload: ICreateAssessmentPayload,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (
    userRole !== Role.ADMIN &&
    userRole !== Role.COMPANY
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to create an assessment",
    );
  }

  if (!payload.title?.trim()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment title is required",
    );
  }

  const accessType =
    payload.accessType ?? AssessmentAccessType.FREE;

  if (accessType === AssessmentAccessType.PAID) {
    if (
      payload.price === undefined ||
      payload.price <= 0
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Price is required for paid assessment",
      );
    }
  }

  if (accessType === AssessmentAccessType.FREE) {
    if (
      payload.price !== undefined &&
      payload.price !== 0
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Free assessment cannot have a price",
      );
    }
  }

  const assessment = await prisma.assessment.create({
    data: {
      title: payload.title.trim(),

      description:
        payload.description?.trim() || null,

      accessType,

      price:
        accessType === AssessmentAccessType.PAID
          ? payload.price
          : null,

      createdById: userId,
    },

    select: {
      id: true,
      title: true,
      description: true,
      accessType: true,
      price: true,
      status: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return assessment;
};

const getAssessments = async (
  query: IGetAssessmentsQuery,
) => {
  const page = Math.max(
    Number(query.page) || 1,
    1,
  );

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100,
  );

  const skip = (page - 1) * limit;

  const search = query.search?.trim();

  const where: Prisma.AssessmentWhereInput = {};

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

  if (query.status) {
    const status =
      query.status.toUpperCase();

    if (
      !Object.values(AssessmentStatus).includes(
        status as AssessmentStatus,
      )
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid assessment status",
      );
    }

    where.status = status as AssessmentStatus;
  }

  if (query.accessType) {
    const accessType =
      query.accessType.toUpperCase();

    if (
      !Object.values(
        AssessmentAccessType,
      ).includes(
        accessType as AssessmentAccessType,
      )
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid assessment access type",
      );
    }

    where.accessType =
      accessType as AssessmentAccessType;
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "title",
  ] as const;

  type SortField =
    (typeof allowedSortFields)[number];

  const requestedSort =
    query.sortBy ?? "createdAt";

  const sortBy: SortField =
    allowedSortFields.includes(
      requestedSort as SortField,
    )
      ? (requestedSort as SortField)
      : "createdAt";

  const sortOrder =
    query.sortOrder === "asc"
      ? "asc"
      : "desc";

  const [assessments, total] =
    await prisma.$transaction([
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
          accessType: true,
          price: true,
          status: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,

          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          _count: {
            select: {
              problems: true,
              payments: true,
              results: true,
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
      totalPages: Math.ceil(
        total / limit,
      ),
    },

    data: assessments,
  };
};

const getAssessmentById = async (
  assessmentId: string,
) => {
  if (!assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment ID is required",
    );
  }

  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        title: true,
        description: true,
        accessType: true,
        price: true,
        status: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        problems: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            title: true,
            description: true,
            marks: true,
            difficulty: true,
            category: true,
            inputFormat: true,
            outputFormat: true,
            constraints: true,
            timeLimit: true,
            memoryLimit: true,
          },
        },

        _count: {
          select: {
            problems: true,
            payments: true,
            results: true,
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

  return assessment;
};

const updateAssessment = async (
  userId: string,
  userRole: Role,
  assessmentId: string,
  payload: IUpdateAssessmentPayload,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment ID is required",
    );
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least one field is required to update the assessment",
    );
  }

  const existingAssessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        createdById: true,
        status: true,
        accessType: true,
        price: true,
      },
    });

  if (!existingAssessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (
    userRole === Role.COMPANY &&
    existingAssessment.createdById !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update this assessment",
    );
  }

  if (
    existingAssessment.status !==
    AssessmentStatus.DRAFT
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only draft assessment can be updated",
    );
  }

  const accessType =
    payload.accessType ??
    existingAssessment.accessType;

  if (
    accessType === AssessmentAccessType.PAID
  ) {
    const finalPrice =
      payload.price !== undefined
        ? payload.price
        : existingAssessment.price;

    if (
      finalPrice === null ||
      finalPrice === undefined ||
      Number(finalPrice) <= 0
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Price is required for paid assessment",
      );
    }
  }

  if (
    accessType === AssessmentAccessType.FREE
  ) {
    if (
      payload.price !== undefined &&
      payload.price !== null &&
      payload.price !== 0
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Free assessment cannot have a price",
      );
    }
  }

  const updatedAssessment =
    await prisma.assessment.update({
      where: {
        id: assessmentId,
      },

      data: {
        ...(payload.title !== undefined && {
          title: payload.title.trim(),
        }),

        ...(payload.description !== undefined && {
          description:
            payload.description.trim() || null,
        }),

        ...(payload.accessType !== undefined && {
          accessType: payload.accessType,
        }),

        ...(payload.price !== undefined && {
          price:
            accessType ===
            AssessmentAccessType.FREE
              ? null
              : payload.price,
        }),
      },

      select: {
        id: true,
        title: true,
        description: true,
        accessType: true,
        price: true,
        status: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return updatedAssessment;
};

const deleteAssessment = async (
  userId: string,
  userRole: Role,
  assessmentId: string,
) => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment ID is required",
    );
  }

  const assessment =
    await prisma.assessment.findUnique({
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

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (
    userRole === Role.COMPANY &&
    assessment.createdById !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this assessment",
    );
  }

  if (
    assessment.status !==
    AssessmentStatus.DRAFT
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only draft assessment can be deleted",
    );
  }

  const deletedAssessment =
    await prisma.assessment.delete({
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
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  if (!assessmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment ID is required",
    );
  }

  if (
    !Object.values(AssessmentStatus).includes(
      status,
    )
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid assessment status",
    );
  }

  const assessment =
    await prisma.assessment.findUnique({
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
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (
    userRole === Role.COMPANY &&
    assessment.createdById !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to manage this assessment",
    );
  }

  /*
   * DRAFT → PUBLISHED
   */
  if (status === AssessmentStatus.PUBLISHED) {
    if (
      assessment.status !==
      AssessmentStatus.DRAFT
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only draft assessment can be published",
      );
    }

    const problemCount =
      await prisma.problem.count({
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
      assessment.accessType ===
        AssessmentAccessType.PAID &&
      (!assessment.price ||
        Number(assessment.price) <= 0)
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Paid assessment must have a valid price",
      );
    }
  }

  /*
   * PUBLISHED → ONGOING
   */
  if (status === AssessmentStatus.ONGOING) {
    if (
      assessment.status !==
      AssessmentStatus.PUBLISHED
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only published assessment can become ongoing",
      );
    }
  }

  /*
   * ONGOING → COMPLETED
   */
  if (status === AssessmentStatus.COMPLETED) {
    if (
      assessment.status !==
      AssessmentStatus.ONGOING
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only ongoing assessment can be completed",
      );
    }
  }

  /*
   * CANCELLED
   */
  if (status === AssessmentStatus.CANCELLED) {
    if (
      assessment.status ===
        AssessmentStatus.COMPLETED ||
      assessment.status ===
        AssessmentStatus.CANCELLED
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This assessment cannot be cancelled",
      );
    }
  }

  const updatedAssessment =
    await prisma.assessment.update({
      where: {
        id: assessmentId,
      },

      data: {
        status,
      },

      select: {
        id: true,
        title: true,
        description: true,
        accessType: true,
        price: true,
        status: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
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