import { Difficulty } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { ICreateProblemPayload } from "./problem.interface.js";

const createProblem = async (
  userId: string,
  payload: ICreateProblemPayload,
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
      deletedAt: null,
      status: "ACTIVE",
    },
  });

  if (!user) {
    throw new AppError(404, "User not found or inactive");
  }

  const problem = await prisma.problem.create({
    data: {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      difficulty: payload.difficulty ?? Difficulty.EASY,
      category: payload.category,

      inputFormat: payload.inputFormat ?? null,
      outputFormat: payload.outputFormat ?? null,
      constraints: payload.constraints ?? null,
      timeLimit: payload.timeLimit ?? null,
      memoryLimit: payload.memoryLimit ?? null,

      createdById: userId,
    },
  });

  return problem;
};

// const getProblems = async (query: any) => {
//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;

//   const skip = (page - 1) * limit;

//   const search = query.search as string | undefined;

//   const category = query.category as string | undefined;

//   const difficulty = query.difficulty as
//     | "EASY"
//     | "MEDIUM"
//     | "HARD"
//     | undefined;

//   const type = query.type as
//     | "MCQ"
//     | "CODING"
//     | "WRITTEN"
//     | undefined;

//   const sortBy = (query.sortBy || "createdAt") as
//     | "createdAt"
//     | "updatedAt"
//     | "title"
//     | "difficulty"
//     | "category";

//   const sortOrder = (query.sortOrder || "desc") as
//     | "asc"
//     | "desc";

//   const where: Prisma.ProblemWhereInput = {
//     deletedAt: null,
//   };

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
//       {
//         category: {
//           contains: search,
//           mode: "insensitive",
//         },
//       },
//     ];
//   }

//   // Category filter
//   if (category) {
//     where.category = {
//       equals: category,
//       mode: "insensitive",
//     };
//   }

//   // Difficulty filter
//   if (difficulty) {
//     where.difficulty = difficulty;
//   }

//   // Problem type filter
//   if (type) {
//     where.type = type;
//   }

//   const [problems, total] = await prisma.$transaction([
//     prisma.problem.findMany({
//       where,
//       skip,
//       take: limit,

//       orderBy: {
//         [sortBy]: sortOrder,
//       },

//       select: {
//         id: true,
//         title: true,
//         description: true,
//         type: true,
//         difficulty: true,
//         category: true,
//         inputFormat: true,
//         outputFormat: true,
//         constraints: true,
//         timeLimit: true,
//         memoryLimit: true,
//         createdById: true,
//         createdAt: true,
//         updatedAt: true,

//         createdBy: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//           },
//         },
//       },
//     }),

//     prisma.problem.count({
//       where,
//     }),
//   ]);

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//     data: problems,
//   };
// };

// const getProblemById = async (problemId: string) => {
//   const problem = await prisma.problem.findFirst({
//     where: {
//       id: problemId,
//       deletedAt: null,
//     },

//     select: {
//       id: true,
//       title: true,
//       description: true,
//       type: true,
//       difficulty: true,
//       category: true,
//       inputFormat: true,
//       outputFormat: true,
//       constraints: true,
//       timeLimit: true,
//       memoryLimit: true,
//       createdById: true,
//       createdAt: true,
//       updatedAt: true,

//       createdBy: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           role: true,
//         },
//       },
//     },
//   });

//   if (!problem) {
//     throw new Error("Problem not found");
//   }

//   return problem;
// };

// const updateProblem = async (
//   userId: string,
//   userRole: Role,
//   problemId: string,
//   payload: {
//     title?: string;
//     description?: string;
//     type?: ProblemType;
//     difficulty?: Difficulty;
//     category?: string;
//     inputFormat?: string;
//     outputFormat?: string;
//     constraints?: string;
//     timeLimit?: number;
//     memoryLimit?: number;
//   },
// ) => {
//   const existingProblem = await prisma.problem.findFirst({
//     where: {
//       id: problemId,
//       deletedAt: null,
//     },
//   });

//   if (!existingProblem) {
//     throw new Error("Problem not found");
//   }

//   // COMPANY can update only own problem
//   if (
//     userRole === Role.COMPANY &&
//     existingProblem.createdById !== userId
//   ) {
//     throw new Error(
//       "You can only update your own problem",
//     );
//   }

//   const updatedProblem = await prisma.problem.update({
//     where: {
//       id: problemId,
//     },

//     data: {
//       ...(payload.title !== undefined && {
//         title: payload.title,
//       }),

//       ...(payload.description !== undefined && {
//         description: payload.description,
//       }),

//       ...(payload.type !== undefined && {
//         type: payload.type,
//       }),

//       ...(payload.difficulty !== undefined && {
//         difficulty: payload.difficulty,
//       }),

//       ...(payload.category !== undefined && {
//         category: payload.category,
//       }),

//       ...(payload.inputFormat !== undefined && {
//         inputFormat: payload.inputFormat,
//       }),

//       ...(payload.outputFormat !== undefined && {
//         outputFormat: payload.outputFormat,
//       }),

//       ...(payload.constraints !== undefined && {
//         constraints: payload.constraints,
//       }),

//       ...(payload.timeLimit !== undefined && {
//         timeLimit: payload.timeLimit,
//       }),

//       ...(payload.memoryLimit !== undefined && {
//         memoryLimit: payload.memoryLimit,
//       }),
//     },
//   });

//   return updatedProblem;
// };

// const deleteProblem = async (
//   userId: string,
//   userRole: Role,
//   problemId: string,
// ) => {
//   const existingProblem = await prisma.problem.findFirst({
//     where: {
//       id: problemId,
//       deletedAt: null,
//     },
//   });

//   if (!existingProblem) {
//     throw new Error("Problem not found");
//   }

//   // COMPANY can delete only own problem
//   if (
//     userRole === Role.COMPANY &&
//     existingProblem.createdById !== userId
//   ) {
//     throw new Error(
//       "You can only delete your own problem",
//     );
//   }

//   const deletedProblem = await prisma.problem.update({
//     where: {
//       id: problemId,
//     },

//     data: {
//       deletedAt: new Date(),
//     },

//     select: {
//       id: true,
//       title: true,
//       deletedAt: true,
//     },
//   });

//   return deletedProblem;
// };

export const ProblemService = {
  createProblem,
//   getProblems,
//   getProblemById,
//   updateProblem,
//   deleteProblem,
};