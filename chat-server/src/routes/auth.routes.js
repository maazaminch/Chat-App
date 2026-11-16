import express from "express";
import authController from "../controllers/auth/auth.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.middleware.js";
import authValidator from "../validators/auth.validator.js";

import Roles from "../constants/roles.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";



const authRouter = express.Router();



authRouter.post(
    "/register",
    validate(authValidator.registerSchema),
    authController.registerUser
);

authRouter.post(
    "/login", 
    validate(authValidator.loginSchema),
    authController.loginUser
);

authRouter.post(
    "/refresh-token", 
    authController.refreshTokens
);

authRouter.post(
    "/logout", 
    authController.logoutUser
);

authRouter.get(
    "/me", 
    verifyToken,
    // roleGuard(Roles.USER, Roles.ADMIN),
    authController.getMe
);

export default authRouter;