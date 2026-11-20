import express from "express";
import ConvoController from "../controllers/converstation/convo.controller.js";
import MessageController from "../controllers/message/message.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import convoValidator from "../validators/convo.validator.js";


const convoRouter = express.Router();

// All routes require authentication
convoRouter.use(verifyToken);

// Find or create DM conversation with another user
convoRouter.post(
    "/create-convo/:userId",
    validate(convoValidator.dmConversationSchema),
    ConvoController.findOrCreateConversation
);

// Get all conversations for the authenticated user
convoRouter.get(
    "/get-convo",
    ConvoController.getConversations
);

// Verify user is member of a conversation
convoRouter.get(
    "/assert-member/:convoId",
    validate(convoValidator.assertMemberSchema),
    ConvoController.assertMember
);

convoRouter.post(
    "/integrations/:convoId",
    validate(convoValidator.addIntegrationSchema),
    ConvoController.addIntegration
);

convoRouter.delete(
    "/integrations/:convoId",
    validate(convoValidator.removeIntegrationSchema),
    ConvoController.removeIntegration
);


export default convoRouter;