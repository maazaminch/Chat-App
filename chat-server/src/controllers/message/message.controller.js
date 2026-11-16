import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import MessageService from "../../services/message.services.js";

class MessageController {

    
    static getConversationMessages = asyncHandler(async (req, res) => {

        const { convoId } = req.params;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 30;

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
            new ApiResponse(
                200,
                result,
                "Messages retrieved successfully"
            )
        );

    });


}

export default MessageController;