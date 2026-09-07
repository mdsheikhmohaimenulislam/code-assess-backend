import type { Prisma } from "../../../generated/prisma/client.js";
import { ProblemType, Role } from "../../../generated/prisma/enums.js";
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
    type,
    difficulty,
    category,
    inputFormat,
    outputFormat,
    constraints,
    timeLimit,
    memoryLimit,
    options,
  } = payload;

  // MCQ Validation

  // MCQ feature future এ enable করার জন্য
  // এই validation রেখে দেওয়া হলো.

  // if (type === ProblemType.MCQ) {
  //   if (!options || options.length < 2) {
  //     throw new AppError(
  //       httpStatus.BAD_REQUEST,
  //       "MCQ must have at least 2 options",
  //     );
  //   }

  //   const correctOptions = options.filter(
  //     (option) => option.isCorrect,
  //   );

  //   if (correctOptions.length !== 1) {
  //     throw new AppError(
  //       httpStatus.BAD_REQUEST,
  //       "MCQ must have exactly one correct answer",
  //     );
  //   }
  // }

  // ==========================================
  // Coding Validation
  // ==========================================

  if (type === ProblemType.CODING && options) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Options are only allowed for MCQ problems",
    );
  }

  // ==========================================
  // Currently Only Coding Problems Allowed
  // ==========================================

  if (type !== ProblemType.CODING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only coding problems are allowed at this time",
    );
  }

  // ==========================================
  // Create Problem + MCQ Options
  // ==========================================

  const problem = await prisma.$transaction(async (tx) => {
    // ----------------------------------------
    // Create Problem
    // ----------------------------------------

    const createdProblem = await tx.problem.create({
      data: {
        title,
        description,
        type,
        category,

        ...(difficulty && {
          difficulty,
        }),

        ...(inputFormat && {
          inputFormat,
        }),

        ...(outputFormat && {
          outputFormat,
        }),

        ...(constraints && {
          constraints,
        }),

        ...(timeLimit !== undefined && {
          timeLimit,
        }),

        ...(memoryLimit !== undefined && {
          memoryLimit,
        }),

        createdById: userId,
      },
    });

    // ========================================
    // Create MCQ Options
    // ========================================
    // Future এ MCQ enable করলে এই অংশ কাজ করবে.
    // বর্তমানে উপরের restriction এর কারণে
    // MCQ এখানে আসতে পারবে না.

    // if (
    //   type === ProblemType.MCQ &&
    //   options &&
    //   options.length > 0
    // ) {
    //   await tx.mCQOption.createMany({
    //     data: options.map((option) => ({
    //       problemId: createdProblem.id,
    //       text: option.text,
    //       isCorrect: option.isCorrect,
    //     })),
    //   });
    // }

    return createdProblem;
  });

  // Return Problem + MCQ Options

  const result = await prisma.problem.findUnique({
    where: {
      id: problem.id,
    },

    include: {
      mcqOptions: true,
    },
  });

  return result;
};

const getProblems = async (query: IGetProblemsQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const title = query.title?.trim();
  const search = query.search?.trim();
  const category = query.category?.trim();

  const where: Prisma.ProblemWhereInput = {};

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
      {
        category: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  //   Title filter
  if (title) {
    where.title = {
      contains: title,
      mode: "insensitive",
    };
  }
  // Category filter
  if (category) {
    where.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  // Difficulty filter
  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }

  // Problem type filter
  if (query.type) {
    where.type = query.type;
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
        type: true,
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
  const problem = await prisma.problem.findFirst({
    where: {
      id: problemId,
    },

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
    },
  });

  if (!problem) {
    throw new AppError(404, "Problem not found");
  }

  return problem;
};

const updateProblem = async (
  userId: string,
  userRole: Role,
  problemId: string,
  payload: IUpdateProblemPayload,
) => {
  // 1. Validate authenticated user
  if (!userId || !userRole) {
    throw new AppError(401, "Unauthorized user");
  }

  // 2. Validate problem ID
  if (!problemId) {
    throw new AppError(400, "Problem ID is required");
  }

  // 3. Validate update payload
  if (Object.keys(payload).length === 0) {
    throw new AppError(
      400,
      "At least one field is required to update the problem",
    );
  }

  // 4. Check whether the problem exists
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
    throw new AppError(404, "Problem not found");
  }

  // 5. COMPANY can update only their own problem
  if (userRole === Role.COMPANY && existingProblem.createdById !== userId) {
    throw new AppError(403, "You can only update your own problem");
  }

  // 6. Update problem
  const updatedProblem = await prisma.problem.update({
    where: {
      id: problemId,
    },

    data: payload,

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
      createdById: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedProblem;
};

const deleteProblem = async (
  userId: string,
  userRole: Role,
  problemId: string,
) => {
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
    throw new AppError(404, "Problem not found");
  }

  // COMPANY can delete only own problem
  if (userRole === Role.COMPANY && existingProblem.createdById !== userId) {
    throw new AppError(403, "You can only delete your own problem");
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
