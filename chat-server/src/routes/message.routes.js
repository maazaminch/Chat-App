import express from "express";
import MessageController from "../controllers/message/message.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import ConvoService from "../services/convo.services.js";


const messageRouter = express.Router();

// All routes require authentication
messageRouter.use(verifyToken);

const verifyConversationMember = async (req, res, next) => {
    await ConvoService.assertMember(req.params.conversationId, req.user._id);
    next();
};


// Get messages for a conversation
messageRouter.get(
    "/get-messages/:convoId",
    MessageController.getConversationMessages
);

messageRouter.get(
    "/get-attachment/:messageId",
    MessageController.getAttachment
);

messageRouter.post(
    '/upload-attachment/:conversationId',
    verifyConversationMember,
    upload.single('file'),
    MessageController.uploadAttachment
)

export default messageRouter;