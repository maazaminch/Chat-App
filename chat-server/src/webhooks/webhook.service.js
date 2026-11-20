import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import ApiError from "../utils/apiError.js";
import constants from "../sockets/socket-constants/constants.js";
import { providers } from "./providers/index.js";

class WebhookService {
    static receive = async ({ providerName, headers, rawBody, io }) => {
        if (!Object.hasOwn(providers, providerName)) {
            throw new ApiError(404, "Webhook provider not found");
        }

        const provider = providers[providerName];

        if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
            throw new ApiError(400, "Webhook body is required");
        }

        const { event, signature } = provider.adapter.readHeaders(headers);
        if (!event) {
            throw new ApiError(400, "Provider event header is required");
        }

        const isValid = provider.adapter.verify({
            rawBody,
            signature,
            secret: provider.secret,
        });
        if (!isValid) {
            throw new ApiError(401, "Invalid webhook signature");
        }

        let payload;
        try {
            payload = JSON.parse(rawBody.toString("utf8"));
        } catch {
            throw new ApiError(400, "Webhook body must contain valid JSON");
        }

        const normalized = provider.adapter.normalize({ event, payload });
        if (!normalized) {
            return { ignored: true, messagesCreated: 0 };
        }

        if (!io) {
            throw new ApiError(503, "Chat socket is unavailable");
        }

        const conversations = await Conversation.find({
            integrations: {
                $elemMatch: {
                    provider: normalized.provider,
                    resourceId: normalized.resourceId,
                    events: normalized.event,
                },
            },
        });

        for (const conversation of conversations) {
            const subscription = conversation.integrations.find((integration) =>
                integration.provider === normalized.provider &&
                integration.resourceId === normalized.resourceId &&
                integration.events.includes(normalized.event)
            );

            if (!subscription?.linkedBy) {
                throw new ApiError(500, "Conversation integration has no linked user");
            }

            const message = await Message.create({
                conversationId: conversation._id,
                senderId: subscription.linkedBy,
                text: normalized.text,
            });

            conversation.lastMessage = message._id;
            await conversation.save();
            await message.populate("senderId", "name email");

            for (const memberId of conversation.memberIds) {
                io.to(constants.USER_ROOM(memberId.toString()))
                    .emit("dm:new", message);
            }
        }

        return { ignored: false, messagesCreated: conversations.length };
    }
}

export default WebhookService;