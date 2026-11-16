import express from "express";
import MessageController from "../controllers/message/message.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";


const messageRouter = express.Router();

// All routes require authentication
messageRouter.use(verifyToken);


// Get messages for a conversation
messageRouter.get(
    "/get-messages/:convoId",
    MessageController.getConversationMessages
);

export default messageRouter;