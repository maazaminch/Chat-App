import ApiError from "../utils/apiError.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

class ConvoService {

    static findOrCreateDirectConversation = async (userId1, userId2) => {
        if (userId1.toString() === userId2.toString()) {
            throw new ApiError(400, "Cannot create conversation with yourself");
        }

        const directKey = [userId1, userId2].sort().join(':');

        // Validate users exist
        const [user1, user2] = await Promise.all([
            User.findById(userId1),
            User.findById(userId2)
        ]);

        if (!user1 || !user2) {
            throw new ApiError(404, "One or both users not found");
        }

        const conversation = await Conversation.findOne({ directKey });
        if (conversation) {
            return conversation;
        }

        const newConversation = await Conversation.create({
            directKey,
            memberIds: [userId1, userId2]
        });
        return newConversation;
    }

    static getConversations = async (userId, search = '') => {
        let filter = { memberIds: userId };
        let newUsers = [];
        const searchTerm = typeof search === 'string' ? search.trim() : '';

        if (searchTerm) {
            const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Find users matching the search (excluding current user)
            const matchingUsers = await User.find({
                $or: [
                    { name: { $regex: escapedSearch, $options: 'i' } },
                    { email: { $regex: escapedSearch, $options: 'i' } }
                ],
                _id: { $ne: userId }  // Exclude current user from search
            }).select('_id name email avatar');

            if (matchingUsers.length > 0) {
                const matchingUserIds = matchingUsers.map(u => u._id);

                const filteredConversations = await Conversation.find({
                    $and: [
                        { memberIds: userId },
                        { memberIds: { $in: matchingUserIds } }
                    ]
                })
                    .populate('memberIds', 'name email avatar')
                    .populate('lastMessage')
                    .sort({ updatedAt: -1 });

                const existingUserIds = new Set(
                    filteredConversations.flatMap(conversation =>
                        conversation.memberIds
                            .map(member => String(member?._id ?? member))
                            .filter(memberId => memberId !== String(userId))
                    )
                );

                // New users are those who match search but don't have a conversation yet
                newUsers = matchingUsers.filter(user =>
                    !existingUserIds.has(String(user._id))
                );

                return {
                    conversations: filteredConversations,
                    totalConversations: filteredConversations.length,
                    newUsers
                };
            } else {
                // No users match search, return empty results
                return { conversations: [], totalConversations: 0, newUsers: [] };
            }
        }

        const conversations = await Conversation.find(filter)
            .populate('memberIds', 'name email avatar')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        const totalConversations = await Conversation.countDocuments(filter);

        return { conversations, totalConversations, newUsers };
    }

    // Verify user is member of a conversation
    static assertMember = async (conversationId, userId) => {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new ApiError(404, "Conversation not found");
        }
        if (!conversation.memberIds.some(id => id.equals(userId))) {
            throw new ApiError(403, "User is not a member of this conversation");
        }
        return conversation;
    }

    static addIntegration = async (conversationId, userId, integrationData) => {
        const conversation = await ConvoService.assertMember(conversationId, userId);
        const resourceId = integrationData.resourceId.trim().toLowerCase();

        const existingIntegration = conversation.integrations.find((integration) =>
            integration.provider === integrationData.provider &&
            integration.resourceId === resourceId
        );

        if (existingIntegration) {
            existingIntegration.events = integrationData.events;
            existingIntegration.linkedBy = userId;
        } else {
            conversation.integrations.push({
                provider: integrationData.provider,
                resourceId,
                events: integrationData.events,
                linkedBy: userId
            });
        }

        await conversation.save();
        return conversation;
    }

    static removeIntegration = async (conversationId, userId, integrationData) => {
        const conversation = await ConvoService.assertMember(conversationId, userId);
        const resourceId = integrationData.resourceId.trim().toLowerCase();
        const matchingIntegration = conversation.integrations.some((integration) =>
            integration.provider === integrationData.provider &&
            integration.resourceId === resourceId
        );

        if (!matchingIntegration) {
            throw new ApiError(404, "Repository integration not found");
        }

        conversation.integrations = conversation.integrations.filter((integration) =>
            integration.provider !== integrationData.provider ||
            integration.resourceId !== resourceId
        );

        await conversation.save();
        return conversation;
    }
}

export default ConvoService;