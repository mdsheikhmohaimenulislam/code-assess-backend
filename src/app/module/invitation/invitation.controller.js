import { catchAsync } from "../../utils/catchAsync.js";
import { InvitationService } from "./invitation.service.js";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
const createInvitation = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const result = await InvitationService.createInvitation(
		userId,
		userRole,
		req.body,
	);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Invitation created successfully",
		data: result,
	});
});
const getInvitations = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const result = await InvitationService.getInvitations(
		userId,
		userRole,
		req.query,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Invitations retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});
const getInvitationById = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const invitationId = req.params.id;
	if (!invitationId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invitation ID is required");
	}
	const result = await InvitationService.getInvitationById(
		userId,
		userRole,
		invitationId,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Invitation retrieved successfully",
		data: result,
	});
});
const acceptInvitation = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const invitationId = req.params.id;
	if (!invitationId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invitation ID is required");
	}
	const result = await InvitationService.acceptInvitation(userId, invitationId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Invitation accepted successfully",
		data: result,
	});
});
const rejectInvitation = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const invitationId = req.params.id;
	if (!invitationId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invitation ID is required");
	}
	const result = await InvitationService.rejectInvitation(userId, invitationId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Invitation rejected successfully",
		data: result,
	});
});
const deleteInvitation = catchAsync(async (req, res) => {
	const userId = req.user?.userId;
	const userRole = req.user?.role;
	if (!userId || !userRole) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
	}
	const invitationId = req.params.id;
	if (!invitationId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invitation ID is required");
	}
	await InvitationService.deleteInvitation(userId, userRole, invitationId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Invitation deleted successfully",
		data: null,
	});
});
export const InvitationController = {
	createInvitation,
	getInvitations,
	getInvitationById,
	acceptInvitation,
	rejectInvitation,
	deleteInvitation,
};
//# sourceMappingURL=invitation.controller.js.map
