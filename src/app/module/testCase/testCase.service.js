import { ProblemType, Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
// Create Test Case
const createTestCase = async (userId, userRole, problemId, payload) => {
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
		throw new AppError(httpStatus.NOT_FOUND, "Problem not found");
	}
	// Company can add test case only to own problem
	if (userRole === Role.COMPANY && problem.createdById !== userId) {
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
const getTestCase = async (userId, userRole, testCaseId) => {
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
		throw new AppError(httpStatus.NOT_FOUND, "Test case not found");
	}
	// ==========================================
	// 2. Company can only access own problem
	// ==========================================
	if (userRole === Role.COMPANY && testCase.problem.createdById !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to view this test case",
		);
	}
	// ==========================================
	// 3. Candidate cannot see hidden test case
	// ==========================================
	if (userRole === Role.CANDIDATE && testCase.isHidden) {
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
// Update Test Case
const updateTestCase = async (userId, userRole, id, payload) => {
	const testCase = await prisma.testCase.findUnique({
		where: {
			id,
		},
		include: {
			problem: {
				select: {
					id: true,
					createdById: true,
					type: true,
				},
			},
		},
	});
	if (!testCase) {
		throw new AppError(httpStatus.NOT_FOUND, "Test case not found");
	}
	// COMPANY can update only their own problem's test case
	if (userRole === Role.COMPANY && testCase.problem.createdById !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to update this test case",
		);
	}
	const updatedTestCase = await prisma.testCase.update({
		where: {
			id,
		},
		data: {
			...(payload.input !== undefined && {
				input: payload.input,
			}),
			...(payload.expectedOutput !== undefined && {
				expectedOutput: payload.expectedOutput,
			}),
			...(payload.isHidden !== undefined && {
				isHidden: payload.isHidden,
			}),
		},
	});
	return updatedTestCase;
};
// Delete Test Case
const deleteTestCase = async (userId, userRole, id) => {
	const testCase = await prisma.testCase.findUnique({
		where: {
			id,
		},
		include: {
			problem: {
				select: {
					id: true,
					createdById: true,
					type: true,
				},
			},
		},
	});
	if (!testCase) {
		throw new AppError(httpStatus.NOT_FOUND, "Test case not found");
	}
	// COMPANY can delete only their own problem's test case
	if (userRole === Role.COMPANY && testCase.problem.createdById !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to delete this test case",
		);
	}
	await prisma.testCase.delete({
		where: {
			id,
		},
	});
};
export const TestCaseService = {
	createTestCase,
	getTestCase,
	updateTestCase,
	deleteTestCase,
};
//# sourceMappingURL=testCase.service.js.map
