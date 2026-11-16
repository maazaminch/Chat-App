import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import UserController from "../controllers/user/user.controller.js";

const userRouter = express.Router();

userRouter.use(verifyToken);

userRouter.get("/get-users", UserController.getAllUsers);

userRouter.get("/get-user/:userId", UserController.getUserById);

userRouter.get("/search-users", UserController.searchUsers);

export default userRouter;