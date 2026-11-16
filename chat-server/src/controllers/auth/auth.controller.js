import bcrypt from "bcrypt";
import crypto from "crypto";
import ms from "ms";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";

import User from "../../models/user.model.js";
import RefreshToken from "../../models/refreshToken.model.js";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import AuthService from "../../services/auth.services.js";
import TokenService from "../../services/token.services.js";



class authController {

    static registerUser = async (req, res) => {

        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            throw new ApiError(400, "Name, email and password are required");
        }

        const { 
            user, 
            accessToken, 
            refreshRawToken,
            refreshTokenCookies 
        } = await AuthService.registerUser({ name, email, password });

        return res
            .status(201)
            .cookie('refreshToken', refreshRawToken, refreshTokenCookies)
            .json(new ApiResponse(
                201, 
                { user, accessToken }, 
                "User registered successfully"
            ));
    }

    
    static loginUser = async (req, res) => {
        
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        const { 
            user, 
            accessToken, 
            refreshRawToken,
            refreshTokenCookies 
        } = await AuthService.loginUser(email, password);

            return res
                .status(200)
                .cookie('refreshToken', refreshRawToken, refreshTokenCookies)
                .json(new ApiResponse(200, {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                },
                accessToken
            }, "Login successful"));

    }

    static refreshTokens = async (req, res) => {
        try {

            const rawToken = req.cookies.refreshToken;
            if (!rawToken) {
                throw new ApiError(401, "No refresh token provided. Please login again.");    
            }  

            const { 
                accessToken, 
                refreshRawToken, 
                refreshTokenCookies 
            } = await TokenService.refreshTokens(rawToken);

            return res
                .status(200)
                .cookie('refreshToken', refreshRawToken, refreshTokenCookies)
                .json(new ApiResponse(200, {
                    accessToken
                }, "Refresh token successful"));
        } catch (error) {
            console.error("Error in refreshToken:", error);
            if (error.statusCode) {
                throw error;
            }
            throw new ApiError(500, "Internal server error");
        }
    }

    static logoutUser = async (req, res) => {
        
            const rawToken = req.cookies.refreshToken;
            if (!rawToken) {
                throw new ApiError(401, "No refresh token provided");
            }

            await AuthService.logoutUser(rawToken);
            
            return res
                .status(204)
                .clearCookie('refreshToken', { path: '/' })
                .json(new ApiResponse(204, {}, "Logout successful"));

        
    }
        
    static getMe = async (req, res) => {
        try {
            const user = req.user; 

            if (!user) {
                throw new ApiError(404, "User not found");
            }

            return res.status(200).json(new ApiResponse(200, {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }
            }, "User retrieved successfully"));

        } catch (error) {
            console.error("Error in getMe:", error);
            throw new ApiError(500, "Internal server error");
        }
    }

}

export default authController;