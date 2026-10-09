import type { Prisma } from "../../../generated/prisma/client.js";
import { Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";

import type {
  ICreateProblemPayload,
  IGetProblemsQuery,
  IUpdateProblemPayload,
} from "./problem.interface.js";

const createProblem = async (
  userId: string,
  payload: ICreateProblemPayload,
) => {
  const {
    title,
    description,
    answer,
    marks,
    difficulty,
    category,
    inputFormat,
    outputFormat,
    constraints,
    timeLimit,
    memoryLimit,
    isPaid,
    price,
  } = payload;


  console.log("CREATE PROBLEM PAYLOAD:", payload);
console.log("isPaid:", isPaid);
console.log("price:", price);

  const problem = await prisma.problem.create({
    data: {
      title,
      description,
      answer,
      marks: marks ?? 1,
      difficulty: difficulty ?? "EASY",
      category,
      inputFormat,
      outputFormat,
      constraints,
      timeLimit,
      memoryLimit,

      isPaid: isPaid ?? false,
      price: isPaid ? price : null,

      createdById: userId,
    },

    select: {
      id: true,
      title: true,
      description: true,
      answer: true,
      marks: true,
      difficulty: true,
      category: true,
      inputFormat: true,
      outputFormat: true,
      constraints: true,
      timeLimit: true,
      memoryLimit: true,

      isPaid: true,
      price: true,

      createdById: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return problem;
};

const getProblems = async (query: IGetProblemsQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const title = query.title?.trim();
  const search = query.search?.trim();
  const category = query.category?.trim();

  const where: Prisma.ProblemWhereInput = {};

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
      {
        category: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (title) {
    where.title = {
      contains: title,
      mode: "insensitive",
    };
  }

  if (category) {
    where.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }

  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const [problems, total] = await prisma.$transaction([
    prisma.problem.findMany({
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
        marks: true,
        difficulty: true,
        category: true,
        inputFormat: true,
        outputFormat: true,
        constraints: true,
        timeLimit: true,
        memoryLimit: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        isPaid: true,
        price: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),

    prisma.problem.count({
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
    data: problems,
  };
};

const getProblemById = async (problemId: string) => {
  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
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
      createdById: true,
      createdAt: true,
      updatedAt: true,
  isPaid: true,
  price: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });




  
  if (!problem) {
    throw new AppError(httpStatus.NOT_FOUND, "Problem not found");
  }

  return problem;
};

const updateProblem = async (
  userId: string,
  userRole: Role,
  problemId: string,
  payload: IUpdateProblemPayload,
) => {
  if (!userId || !userRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
  }

  if (!problemId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Problem ID is required");
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least one field is required to update the problem",
    );
  }

  const existingProblem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },

    select: {
      id: true,
      createdById: true,
    },
  });

  if (!existingProblem) {
    throw new AppError(httpStatus.NOT_FOUND, "Problem not found");
  }

  if (userRole === Role.COMPANY && existingProblem.createdById !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own problem",
    );
  }

  const updatedProblem = await prisma.problem.update({
    where: {
      id: problemId,
    },

data: {
  ...(payload.title !== undefined && {
    title: payload.title,
  }),

  ...(payload.description !== undefined && {
    description: payload.description,
  }),

  ...(payload.answer !== undefined && {
    answer: payload.answer,
  }),

  ...(payload.marks !== undefined && {
    marks: payload.marks,
  }),

  ...(payload.difficulty !== undefined && {
    difficulty: payload.difficulty,
  }),

  ...(payload.category !== undefined && {
    category: payload.category,
  }),

  ...(payload.inputFormat !== undefined && {
    inputFormat: payload.inputFormat,
  }),

  ...(payload.outputFormat !== undefined && {
    outputFormat: payload.outputFormat,
  }),

  ...(payload.constraints !== undefined && {
    constraints: payload.constraints,
  }),

  ...(payload.timeLimit !== undefined && {
    timeLimit: payload.timeLimit,
  }),

  ...(payload.memoryLimit !== undefined && {
    memoryLimit: payload.memoryLimit,
  }),

  ...(payload.isPaid !== undefined && {
    isPaid: payload.isPaid,
  }),

  ...(payload.isPaid !== undefined && {
    price: payload.isPaid
      ? payload.price ?? null
      : null,
  }),
},

    select: {
      id: true,
      title: true,
      description: true,
      answer: true,
      marks: true,
      difficulty: true,
      category: true,
      inputFormat: true,
      outputFormat: true,
      constraints: true,
      timeLimit: true,
      memoryLimit: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
        isPaid: true,
  price: true,
    },
  });

  return updatedProblem;
};

const deleteProblem = async (
  userId: string,
  userRole: Role,
  problemId: string,
) => {
  if (!userId || !userRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
  }

  if (!problemId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Problem ID is required");
  }

  const existingProblem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },

    select: {
      id: true,
      createdById: true,
    },
  });

  if (!existingProblem) {
    throw new AppError(httpStatus.NOT_FOUND, "Problem not found");
  }

  if (userRole === Role.COMPANY && existingProblem.createdById !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own problem",
    );
  }

  await prisma.problem.delete({
    where: {
      id: problemId,
    },
  });
};

export const ProblemService = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
