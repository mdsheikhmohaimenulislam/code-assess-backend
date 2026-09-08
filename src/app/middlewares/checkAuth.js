import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { jwtUtils } from "../utils/jwt.js";
import config from "../config/index.js";
import { prisma } from "../lib/prisma.js";
// auth(Role.ADMIN, Role.USER, Role.Author)
// auth() => ...requiredRoles => [Role.ADMIN, Role.USER, Role.AUTHOR]
export const auth = (...requiredRoles) => {
	return catchAsync(async (req, res, next) => {
		const token = req.cookies.accessToken
			? req.cookies.accessToken
			: req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization?.split(" ")[1]
				: req.headers.authorization;
		if (!token) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not logged in. Please log in to access this resource.",
			);
		}
		const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
		if (!verifiedToken.success) {
			throw new AppError(httpStatus.UNAUTHORIZED, verifiedToken.error);
		}
		const { email, name, userId, role } = verifiedToken.data;
		if (requiredRoles.length && !requiredRoles.includes(role)) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden. You don't have permission to access this resource.",
			);
		}
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				email,
				name,
				role,
			},
		});
		if (!user) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"User not found. Please log in again.",
			);
		}
		if (user.status === "BLOCKED") {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Your account has been blocked. Please contact support.",
			);
		}
		if (user.status === "INACTIVE") {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Your account is inactive. Please contact support.",
			);
		}
		req.user = {
			email,
			name,
			userId,
			role,
		};
		next();
	});
};
//# sourceMappingURL=checkAuth.js.map
