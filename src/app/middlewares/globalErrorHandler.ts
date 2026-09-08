import type { NextFunction, Request, Response } from "express";

import httpStatus from "http-status";

import { Prisma } from "../../generated/prisma/client.js";

import config from "../config/index.js";

import { AppError } from "../utils/AppError.js";

export const globalErrorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	// =========================
	// Console Error
	// =========================

	if (config.node_env === "development") {
		console.error("========== ERROR ==========");
		console.error(err);
		console.error("===========================");
	}

	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;

	let errorMessage = "Internal Server Error";

	let errorName = "Internal Server Error";

	// =========================
	// App Error
	// =========================

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		errorMessage = err.message;
		errorName = err.name;
	}

	// =========================
	// Prisma Validation Error
	// =========================
	else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = httpStatus.BAD_REQUEST;

		errorMessage =
			config.node_env === "development"
				? err.message
				: "Invalid data provided. Please check your input.";

		errorName = "PrismaValidationError";
	}

	// =========================
	// Prisma Known Request Error
	// =========================
	else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		errorName = "PrismaKnownRequestError";

		console.error("========== PRISMA KNOWN ERROR ==========");

		console.error("CODE:", err.code);
		console.error("MESSAGE:", err.message);
		console.error("META:", err.meta);

		console.error("========================================");

		switch (err.code) {
			case "P2002":
				statusCode = httpStatus.CONFLICT;

				errorMessage = "A record with this value already exists.";

				break;

			case "P2003":
				statusCode = httpStatus.BAD_REQUEST;

				errorMessage = "Foreign key constraint failed.";

				break;

			case "P2025":
				statusCode = httpStatus.NOT_FOUND;

				errorMessage = "The requested record was not found.";

				break;

			default:
				statusCode = httpStatus.INTERNAL_SERVER_ERROR;

				errorMessage =
					config.node_env === "development"
						? err.message
						: "A database error occurred.";
		}
	}

	// =========================
	// Prisma Initialization Error
	// =========================
	else if (err instanceof Prisma.PrismaClientInitializationError) {
		errorName = "PrismaInitializationError";

		console.error("========== PRISMA INITIALIZATION ERROR ==========");

		console.error("CODE:", err.errorCode);
		console.error("MESSAGE:", err.message);

		console.error("=================================================");

		if (err.errorCode === "P1000") {
			statusCode = httpStatus.UNAUTHORIZED;

			errorMessage = "Database authentication failed.";
		} else if (err.errorCode === "P1001") {
			statusCode = httpStatus.INTERNAL_SERVER_ERROR;

			errorMessage = "Cannot reach the database server.";
		} else {
			statusCode = httpStatus.INTERNAL_SERVER_ERROR;

			errorMessage =
				config.node_env === "development"
					? err.message
					: "Database initialization failed.";
		}
	}

	// =========================
	// Prisma Unknown Request Error
	// =========================
	else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;

		errorName = "PrismaUnknownRequestError";

		console.error("========== PRISMA UNKNOWN ERROR ==========");

		console.error("MESSAGE:", err.message);
		console.error("ERROR:", err);

		console.error("==========================================");

		errorMessage =
			config.node_env === "development"
				? err.message
				: "An error occurred while executing the database query.";
	}

	// =========================
	// Normal Error
	// =========================
	else if (err instanceof Error) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;

		errorName = err.name;
		errorMessage = err.message;

		console.error("ERROR NAME:", err.name);
		console.error("ERROR MESSAGE:", err.message);
		console.error("STACK:", err.stack);
	}

	// =========================
	// Response
	// =========================

	res.status(statusCode).json({
		success: false,
		statusCode,
		name: errorName,
		message: errorMessage,

		...(config.node_env === "development" && {
			stack: err instanceof Error ? err.stack : undefined,
		}),
	});
};
