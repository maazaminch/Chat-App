import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { apiKeyAuth } from "../middlewares/apiKey.middleware.js";
import ApiKeyController from "../controllers/apiKey/apiKey.controller.js";

const apiKeyRouter = express.Router();

apiKeyRouter.post(
    "/generate-apikey", 
    verifyToken, 
    ApiKeyController.generate
);

apiKeyRouter.delete(
    "/revoke-apikey", 
    verifyToken, 
    ApiKeyController.revoke
);

apiKeyRouter.get(
    "/status",
    verifyToken,
    ApiKeyController.getStatus
);

apiKeyRouter.get(
    '/conversations',
    apiKeyAuth,
    ApiKeyController.getConversations
);

apiKeyRouter.get(
    '/messages/:convoId',
    apiKeyAuth,
    ApiKeyController.getMessages
);


export default apiKeyRouter;