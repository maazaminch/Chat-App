

import ConvoService from "./convo.services.js";
import ApiError from "../utils/apiError.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

class MessageService {

    static createMessage = async (conversationId, userId, text) => {
        const isMember = await ConvoService.assertMember(conversationId, userId);

        if(typeof text !== 'string') {
            throw new ApiError(400, "Message text must be a string");
        }

        const cleanedText = text.trim();
        if (!cleanedText || cleanedText.length > 500) {
            throw new ApiError(400, "Message text cannot be empty or exceed 500 characters");
        }
        
        const message = await Message.create({
            conversationId,
            senderId: userId,
            text: cleanedText
        });

        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(conversationId, 
            {
                $set: {
                    lastMessage: message._id
                }
            },
            {
                runValidators: true
            }
        );
        
        return message;
    }

    static getConversationMessages = async (
        conversationId,
        userId,
        page = 1,
        limit = 30
    ) => {

        // Verify conversation membership
        await ConvoService.assertMember(conversationId, userId);

        const skip = (page - 1) * limit;

        const [messages, totalMessages] = await Promise.all([

            Message.find({ conversationId })
                .populate("senderId", "name email")
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Message.countDocuments({ conversationId })

        ]);

        // Reverse to display oldest -> newest
        messages.reverse();

        return {
            messages,
            pagination: {
                page,
                limit,
                totalMessages,
                totalPages: Math.ceil(totalMessages / limit),
                hasMore: skip + messages.length < totalMessages
            }
        };
    };


    // File uploads
    static uploadAttachment = async (
        conversationId,
        userId,
        text,
        attachment
    ) => {
        await ConvoService.assertMember(conversationId, userId)

        const cleanedText = typeof text === 'string' ? text.trim() : ''

        if(cleanedText.length > 500) {
            throw new ApiError(400, 'Message text cannot exceed 500 characters')
        }

        const message = await Message.create({
            conversationId,
            senderId: userId,
            text: cleanedText,
            attachment
        })

        await Conversation.findByIdAndUpdate(
            conversationId,
            { $set: { lastMessage: message._id } },
            { runValidators: true }
        )

        return message;
    }
}

export default MessageService;