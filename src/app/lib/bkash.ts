import httpStatus from "http-status";

import { redisClient } from "./redis.js";
import config from "../config/index.js";
import { AppError } from "../utils/AppError.js";

export const getBkashIdToken = async (): Promise<string> => {
  try {
    const idTokenKey = "bkash:idToken";
    const refreshTokenKey = "bkash:refreshToken";

    let bkashIdToken = await redisClient.get(idTokenKey);

    const bkashTokenTTL = await redisClient.ttl(idTokenKey);

    const bkashRefreshToken =
      await redisClient.get(refreshTokenKey);

    const bkashRefreshTokenTTL =
      await redisClient.ttl(refreshTokenKey);

    // ==========================================
    // 1. Refresh token দিয়ে নতুন ID token নেওয়া
    // ==========================================
    if (
      bkashTokenTTL <= 600 &&
      bkashRefreshToken &&
      bkashRefreshTokenTTL > 600
    ) {
      const response = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.bkash_username,
            password: config.bkash_password,
          },
          body: JSON.stringify({
            app_key: config.bkash_app_key,
            app_secret: config.bkash_app_secret,
            refresh_token: bkashRefreshToken,
          }),
        },
      );

      if (!response.ok) {
        throw new AppError(
          httpStatus.BAD_GATEWAY,
          "Bkash access token refresh failed",
        );
      }

      const result: {
        id_token?: string;
      } = await response.json();

      // ID token পাওয়া গেছে কিনা check
      if (!result.id_token) {
        throw new AppError(
          httpStatus.BAD_GATEWAY,
          "Bkash ID token not received from refresh API",
        );
      }

      bkashIdToken = result.id_token;

      await redisClient.set(idTokenKey, bkashIdToken, {
        expiration: {
          type: "EX",
          value: 60 * 60,
        },
      });

      return bkashIdToken;
    }

    // ==========================================
    // 2. Existing valid token থাকলে সেটাই return
    // ==========================================
    if (bkashIdToken && bkashTokenTTL > 600) {
      return bkashIdToken;
    }

    // ==========================================
    // 3. নতুন token grant করা
    // ==========================================
    const response = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config.bkash_username,
          password: config.bkash_password,
        },
        body: JSON.stringify({
          app_key: config.bkash_app_key,
          app_secret: config.bkash_app_secret,
        }),
      },
    );

    if (!response.ok) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        "Bkash access token grant failed",
      );
    }

    const result: {
      id_token?: string;
      refresh_token?: string;
    } = await response.json();

    // ==========================================
    // ID Token check
    // ==========================================
    if (!result.id_token) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        "Bkash ID token not received",
      );
    }

    // ==========================================
    // Refresh Token check
    // ==========================================
    if (!result.refresh_token) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        "Bkash refresh token not received",
      );
    }

    // ==========================================
    // ID Token Redis-এ save
    // ==========================================
    await redisClient.set(
      idTokenKey,
      result.id_token,
      {
        expiration: {
          type: "EX",
          value: 60 * 60,
        },
      },
    );

    // ==========================================
    // Refresh Token Redis-এ save
    // ==========================================
    await redisClient.set(
      refreshTokenKey,
      result.refresh_token,
      {
        expiration: {
          type: "EX",
          value: 60 * 60 * 24 * 28,
        },
      },
    );

    return result.id_token;
  } catch (error: any) {
    // AppError হলে original error/status রাখবে
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Bkash token error",
    );
  }
};