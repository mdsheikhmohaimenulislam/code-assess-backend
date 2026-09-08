import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AuthService } from "./auth.service.js";
import { AppError } from "../../utils/AppError.js";
import config from "../../config/index.js";
import { jwtUtils } from "../../utils/jwt.js";
const register = catchAsync(async (req, res) => {
	const payload = req.body;
	await AuthService.register(payload);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Verification OTP Sent",
		data: null,
	});
});
const verifyEmail = catchAsync(async (req, res) => {
	const payload = req.body;
	const result = await AuthService.verifyEmail(payload);
	const { accessToken, refreshToken, user } = result;
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Email Verified Successfully",
		data: {
			accessToken,
			refreshToken,
			user,
		},
	});
});
const loginUser = catchAsync(async (req, res) => {
	const payload = req.body;
	const result = await AuthService.loginUser(payload);
	const { accessToken, refreshToken } = result;
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			accessToken,
			refreshToken,
		},
	});
});
const getMe = catchAsync(async (req, res) => {
	const user = req.user;
	if (!user) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"User information is missing in the request",
		);
	}
	const result = await AuthService.getMe(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile fetched successfully",
		data: result,
	});
});
const refreshToken = catchAsync(async (req, res) => {
	if (!req.cookies.refreshToken) {
		throw new AppError(httpStatus.BAD_REQUEST, "Refresh token is missing");
	}
	const result = await AuthService.refreshToken(req.cookies.refreshToken);
	const { accessToken, refreshToken: newRefreshToken } = result;
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", newRefreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "New tokens generated successfully",
		data: {
			accessToken,
			refreshToken: newRefreshToken,
		},
	});
});
const forgotPassword = catchAsync(async (req, res) => {
	const payload = req.body;
	await AuthService.forgotPassword(payload);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: `OTP Sent To Email : ${payload.email}`,
		data: null,
	});
});
const resetPassword = catchAsync(async (req, res) => {
	const payload = req.body;
	await AuthService.resetPassword(payload);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Password Changed Successfully",
		data: null,
	});
});
const googleLogin = catchAsync(async (req, res) => {
	const user = req.user;
	if (!user) {
		return res.redirect(
			`${config.frontend_url}/login?error=google-login-failed`,
		);
	}
	const jwtPayload = {
		userId: user.userId,
		name: user.name,
		email: user.email,
		role: user.role,
	};
	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in,
	);
	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in,
	);
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		maxAge: 1000 * 60 * 60 * 24,
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		maxAge: 1000 * 60 * 60 * 24 * 7,
	});
	return res.redirect(
		`${config.frontend_url}/google-success?role=${user.role}`,
	);
});
export const AuthController = {
	register,
	verifyEmail,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	forgotPassword,
	resetPassword,
};
//# sourceMappingURL=auth.controller.js.map
