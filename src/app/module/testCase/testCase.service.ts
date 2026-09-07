
import type { Prisma } from "../../../generated/prisma/client.js";
import { ProblemType, Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateTestCasePayload } from "./testCase.interface.js";
import httpStatus from 'http-status';




// Create Test Case
const createTestCase = async (
  userId: string,
  userRole: Role,
  problemId: string,
  payload: CreateTestCasePayload,
) => {
  // Check problem
  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
    select: {
      id: true,
      type: true,
      createdById: true,
    },
  });

  if (!problem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem not found",
    );
  }

  // Company can add test case only to own problem
  if (
    userRole === Role.COMPANY &&
    problem.createdById !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to add a test case to this problem",
    );
  }

  // Test cases are only for coding problems
  if (problem.type !== ProblemType.CODING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Test cases can only be added to coding problems",
    );
  }

  // Create test case
  const testCase = await prisma.testCase.create({
    data: {
      problemId,
      input: payload.input,
      expectedOutput: payload.expectedOutput,
      isHidden: payload.isHidden ?? true,
    },
  });

  return testCase;
};

// Get all Test Cases of a Problem
const getTestCase = async (
  userId: string,
  userRole: Role,
  testCaseId: string,
) => {
  // ==========================================
  // 1. Find test case
  // ==========================================

  const testCase = await prisma.testCase.findUnique({
    where: {
      id: testCaseId,
    },
    select: {
      id: true,
      problemId: true,
      input: true,
      expectedOutput: true,
      isHidden: true,
      createdAt: true,
      updatedAt: true,

      problem: {
        select: {
          id: true,
          type: true,
          createdById: true,
        },
      },
    },
  });

  if (!testCase) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Test case not found",
    );
  }

  // ==========================================
  // 2. Company can only access own problem
  // ==========================================

  if (
    userRole === Role.COMPANY &&
    testCase.problem.createdById !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this test case",
    );
  }

  // ==========================================
  // 3. Candidate cannot see hidden test case
  // ==========================================

  if (
    userRole === Role.CANDIDATE &&
    testCase.isHidden
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this test case",
    );
  }

  // ==========================================
  // 4. Hide expected output from candidate
  // ==========================================

  if (userRole === Role.CANDIDATE) {
    return {
      id: testCase.id,
      problemId: testCase.problemId,
      input: testCase.input,
      isHidden: false,
      createdAt: testCase.createdAt,
      updatedAt: testCase.updatedAt,
    };
  }

  return testCase;
};


// Get single Test Case
const getTestCaseById = async (
  userId: string,
  userRole: string,
  id: string
) => {
  const testCase = await prisma.testCase.findUnique({
    where: {
      id,
    },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          createdById: true,
        },
      },
    },
  });

  if (!testCase) {
    throw new Error("Test case not found");
  }

  // Candidate cannot see hidden test case
  if (
    userRole === "CANDIDATE" &&
    testCase.isHidden
  ) {
    throw new Error("Test case not found");
  }

  return testCase;
};

// // Update Test Case
// const updateTestCase = async (
//   userId: string,
//   userRole: string,
//   id: string,
//   payload: UpdateTestCasePayload
// ) => {
//   const testCase = await prisma.testCase.findUnique({
//     where: {
//       id,
//     },
//     include: {
//       problem: {
//         select: {
//           createdById: true,
//         },
//       },
//     },
//   });

//   if (!testCase) {
//     throw new Error("Test case not found");
//   }

//   // Company can update only own problem's test case
//   if (
//     userRole === "COMPANY" &&
//     testCase.problem.createdById !== userId
//   ) {
//     throw new Error(
//       "You are not allowed to update this test case"
//     );
//   }

//   const updatedTestCase = await prisma.testCase.update({
//     where: {
//       id,
//     },
//     data: payload,
//   });

//   return updatedTestCase;
// };

// // Delete Test Case
// const deleteTestCase = async (
//   userId: string,
//   userRole: string,
//   id: string
// ) => {
//   const testCase = await prisma.testCase.findUnique({
//     where: {
//       id,
//     },
//     include: {
//       problem: {
//         select: {
//           createdById: true,
//         },
//       },
//     },
//   });

//   if (!testCase) {
//     throw new Error("Test case not found");
//   }

//   // Company can delete only own problem's test case
//   if (
//     userRole === "COMPANY" &&
//     testCase.problem.createdById !== userId
//   ) {
//     throw new Error(
//       "You are not allowed to delete this test case"
//     );
//   }

//   const deletedTestCase = await prisma.testCase.delete({
//     where: {
//       id,
//     },
//   });

//   return deletedTestCase;
// };

export const TestCaseService = {
  createTestCase,
getTestCase,
  getTestCaseById,
//   updateTestCase,
//   deleteTestCase,
};