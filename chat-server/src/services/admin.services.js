import ApiError from "../utils/apiError.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Roles from "../constants/roles.js";

class AdminService {

    static getAllConversations = async (page = 1, limit = 20) => {
        const skip = (page - 1) * limit;

        const [conversations, total] = await Promise.all([
            Conversation.find({})
                .populate('memberIds', 'name email role')
                .populate('lastMessage')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),
            Conversation.countDocuments()
        ]);

        return {
            conversations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + conversations.length < total
            }
        };
    }

    static deleteMessage = async (messageId) => {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new ApiError(404, "Message not found");
        }

        await Message.findByIdAndDelete(messageId);
        return { message: "Message deleted successfully" };
    }

    static banUser = async (userId) => {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.role === Roles.ADMIN) {
            throw new ApiError(400, "Cannot ban admin user");
        }

        if (user.isBanned) {
            throw new ApiError(400, "User is already banned");
        }

        await User.findByIdAndUpdate(userId, { isBanned: true });
        return { message: "User banned successfully" };
    }

    static getAllUsersWithStats = async () => {
        const users = await User.find({})
            .select("name email role isBanned createdAt")
            .sort({ createdAt: -1 });

        const totalUsers = await User.countDocuments();
        const totalConversations = await Conversation.countDocuments();
        const totalMessages = await Message.countDocuments();

        return {
            users,
            stats: {
                totalUsers,
                totalConversations,
                totalMessages
            }
        };
    }
}

export default AdminService;