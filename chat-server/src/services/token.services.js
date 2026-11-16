import jwt from "jsonwebtoken";
import env from "../config/env.js";
import crypto from "crypto";
import ms from "ms";
import mongoose from "mongoose";
import { hashToken } from "../utils/hashToken.js";
import RefreshToken from "../models/refreshToken.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

class TokenService {
    
    static generateAccessToken = (user) => {
        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            env.JWT_ACCESS_SECRET,
            { algorithm: 'HS256', expiresIn: env.ACCESS_TOKEN_TTL }
        );
        return accessToken;
    }
    
    static generateRefreshToken = async (userId, familyId = crypto.randomUUID()) => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashed = hashToken(rawToken);
        
        const refreshTokenTTL = ms(env.REFRESH_TOKEN_TTL);
        const expiredAt = new Date(Date.now() + refreshTokenTTL);

        const refreshTokenCookies = {
            httpOnly: true,
            secure: env.COOKIE_SECURE,
            sameSite: env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/',
            maxAge: refreshTokenTTL
        };

        const refreshToken = await RefreshToken.create({
            userId: userId,
            hashedToken: hashed,
            familyId: familyId,
            expiredAt: expiredAt,
        });
        if(!refreshToken) {
            throw new ApiError(500, 'Failed to create refresh token');
        }
        
        return { 
            refreshRawToken: rawToken,
            refreshTokenCookies
        };
    }

    static refreshTokens = async (rawToken) => {
        const hashed = hashToken(rawToken);
        
        const existingToken = await RefreshToken.findOne({ hashedToken: hashed });
        if (!existingToken) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        if (existingToken.expiredAt < new Date()) {
            await RefreshToken.deleteMany({ familyId: existingToken.familyId });
            throw new ApiError(401, 'Refresh token expired');
        }

        if (existingToken.revokedAt || existingToken.usedAt) {
            await RefreshToken.deleteMany({ familyId: existingToken.familyId });
            throw new ApiError(401, 'Refresh token has already been used or revoked');
        }

        const user = await User.findById(existingToken.userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const accessToken = TokenService.generateAccessToken(user);

        const now = new Date();

        const claimedToken = await RefreshToken.findOneAndUpdate(
            {
                _id: existingToken._id,
                usedAt: null,
                revokedAt: null
            },
            {
                $set: { usedAt: now, revokedAt: now }
            },
            { returnDocument: 'after' }
        );

        if (!claimedToken) {
            await RefreshToken.deleteMany({ familyId: existingToken.familyId });
            throw new ApiError(401, "Refresh token has already been used");
        }
        const { 
            refreshRawToken: newRefreshRawToken,
            refreshTokenCookies 
        } = await TokenService.generateRefreshToken(
            user._id, 
            existingToken.familyId
        );

        return {
            accessToken,
            refreshRawToken: newRefreshRawToken,
            refreshTokenCookies
        };
    }
    



}

export default TokenService;