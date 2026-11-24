import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import ApiKeyService from "../../services/apiKey.services.js";
import ConvoService from "../../services/convo.services.js";
import MessageService from "../../services/message.services.js";

class ApiKeyController {
    static generate = asyncHandler(async (req, res) => {
        const result = await ApiKeyService.generateApiKey(req.user._id);

        return res.status(201).json(
            new ApiResponse(201, result, "API key generated. Copy it now.")
        );
    });

    static revoke = asyncHandler(async (req, res) => {
        await ApiKeyService.revokeApiKey(req.user._id);

        return res.status(200).json(
            new ApiResponse(200, null, "API key revoked")
        );
    });

    static getStatus = asyncHandler(async (req, res) => {
        const result = await ApiKeyService.getApiKeyStatus(req.user._id);

        return res.status(200).json(
            new ApiResponse(200, result, "API key status retrieved")
        );
    });


    static getConversations = asyncHandler(async (req, res) => {
        const result = await ConvoService.getConversations(req.user._id);

        return res.status(200).json(
            new ApiResponse(200, result, "Conversations retrieved")
        );
    });

    static getMessages = asyncHandler(async (req, res) => {
        const { convoId } = req.params;
        const page = req.query.page === undefined ? 1 : Number(req.query.page);
        const limit = req.query.limit === undefined ? 30 : Number(req.query.limit);

        if (!/^[a-f\d]{24}$/i.test(convoId)) {
            throw new ApiError(400, "Invalid conversation ID");
        }

        if (!Number.isInteger(page) || page < 1) {
            throw new ApiError(400, "Invalid page number");
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            throw new ApiError(400, "Limit must be between 1 and 100");
        }

        const result = await MessageService.getConversationMessages(
            convoId,
            req.user._id,
            page,
            limit
        );

        return res.status(200).json(
            new ApiResponse(200, result, "Messages retrieved")
        );
    });
}

export default ApiKeyController;