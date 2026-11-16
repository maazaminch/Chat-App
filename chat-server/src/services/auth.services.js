import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import ms from "ms";
import crypto from "crypto";
import RefreshToken from "../models/refreshToken.model.js";

import TokenService from "./token.services.js";
import { hashToken } from "../utils/hashToken.js";

class AuthService {

    static registerUser = async (data) => {
        
        const { name, email, password } = data;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, "User already exists");
        }
        
        const hashedPassword = await bcrypt.hash(password, env.BCRYPT_COST);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        
        const accessToken = TokenService.generateAccessToken(user);
        const { refreshRawToken, refreshTokenCookies } = await TokenService.generateRefreshToken(user._id);

        const safeUser = await User.findById(user._id).select("-password");
        
        return {
            user: safeUser,
            accessToken,
            refreshRawToken,
            refreshTokenCookies
        };
    }

    static loginUser = async (email, password) => {
        
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            throw new ApiError(400, "User not found");
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(400, "Invalid password");
        }
        
        const accessToken = TokenService.generateAccessToken(user);
        const { refreshRawToken, refreshTokenCookies } = await TokenService.generateRefreshToken(user._id);

        const safeUser = await User.findById(user._id).select("-password");
        
        return {
            user: safeUser,
            accessToken,
            refreshRawToken,
            refreshTokenCookies
        };
    }

    static logoutUser = async (rawToken) => {  
        
        if(!rawToken) {
            throw new ApiError(400, "Refresh token is required");
        }
        const hashed = hashToken(rawToken);
        const existingToken = await RefreshToken.findOne({ hashedToken: hashed });
        
        if (existingToken) {
            await RefreshToken.updateOne(
                {_id: existingToken._id, revokedAt: null },
                { $set: { revokedAt: new Date() } }
            );
        }

        return true;
    }

}

export default AuthService;
