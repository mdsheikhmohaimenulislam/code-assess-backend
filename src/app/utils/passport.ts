import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { prisma } from "../lib/prisma.js";

import config from "../config/index.js";
import {
	AuthProvider,
	Role,
	UserStatus,
} from "../../generated/prisma/enums.js";

passport.use(
	new GoogleStrategy(
		{
			clientID: config.google_client_id,
			clientSecret: config.google_client_secret,
			callbackURL: config.GOOGLE_CLIENT_CALLBACK_URL,
		},

		async (accessToken, refreshToken, profile, done) => {
			try {
				const email = profile.emails?.[0]?.value;

				if (!email) {
					return done(new Error("Google email not found"), undefined);
				}

				const googleId = profile.id;

				let user = await prisma.user.findFirst({
					where: {
						googleId,
					},
				});

				// Google ID দিয়ে user পাওয়া যায়নি
				if (!user) {
					// Email দিয়ে existing user check
					const existingUser = await prisma.user.findUnique({
						where: {
							email,
						},
					});

					if (existingUser) {
						// Existing account-এর সাথে Google account link
						user = await prisma.user.update({
							where: {
								id: existingUser.id,
							},
							data: {
								googleId,
								authProvider: AuthProvider.GOOGLE,
								emailVerified: true,
							},
						});
					} else {
						// New Google user
						user = await prisma.user.create({
							data: {
								name: profile.displayName,
								email,
								googleId,
								authProvider: AuthProvider.GOOGLE,
								role: Role.CANDIDATE,
								status: UserStatus.ACTIVE,
								emailVerified: true,
								imageUrl: profile.photos?.[0]?.value ?? null,
							},
						});
					}
				}

				return done(null, user);
			} catch (error) {
				return done(error, undefined);
			}
		},
	),
);

export default passport;
