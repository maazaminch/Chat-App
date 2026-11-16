import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ConvoService from "../../services/convo.services.js";

class ConvoController {

    // Find or create DM conversation with another user
    static findOrCreateConversation = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const conversation = await ConvoService.findOrCreateDirectConversation(currentUserId, userId);

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                conversation,
                "Conversation found or created successfully"
            ));
    })

    // Get all conversations for the authenticated user
    static getConversations = asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const { search } = req.query;

        const { conversations, totalConversations, newUsers } = await ConvoService.getConversations(userId, search);

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { conversations, totalConversations, newUsers },
                "User conversations retrieved successfully"
            ));
    })

    // Verify user is member of a conversation
    static assertMember = asyncHandler(async (req, res) => {
        const { convoId } = req.params;
        const userId = req.user._id;

        const conversation = await ConvoService.assertMember(convoId, userId);

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { isMember: true, conversation },
                "Member assertion completed"
            ));
    })

}

export default ConvoController;