import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import GithubWebhook from "../models/githubWebhook.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import ConvoService from "./convo.services.js";
import ApiError from "../utils/apiError.js";
import constants from "../sockets/socket-constants/constants.js";
import GithubWebhookValidator from "../validators/githubWebhook.validator.js";


class GithubWebhookService {

    static createWebhook = async (conversationId, userId) => {
        await ConvoService.assertMember(conversationId, userId);

        const existing = await GithubWebhook.findOne({conversationId})
        if (existing) {
            throw new ApiError(409, 'Github webhook already exists')
        }

        const secret = randomBytes(32).toString('hex')

        const integration = await GithubWebhook.create({
            conversationId,
            createdBy: userId,
            secret
        })

        return { 
            integrationId: integration._id,
            secret, 
            webhookPath: `/api/v1/webhooks/github/${integration._id}`
        }
    }



    static receivePush = async ({ integrationId, signature, event, rawBody, io }) => {
        const rawBodyValidation = GithubWebhookValidator.rawBodySchema.safeParse(rawBody);
        if (!rawBodyValidation.success) {
            throw new ApiError(400, "Webhook body is required");
        }

        const integration = await GithubWebhook.findById(integrationId);

        if (!integration || !integration.enabled) {
        throw new ApiError(404, "Webhook not found or disabled!");
        }

        const receivedSignature = signature?.replace(/^sha256=/, "");
        if (!/^[a-f0-9]{64}$/i.test(receivedSignature || "")) {
        throw new ApiError(401, "Invalid GitHub signature");
        }

        const expectedSignature = createHmac('sha256', integration.secret)
            .update(rawBodyValidation.data)
            .digest('hex')

        const receivedBuffer = Buffer.from(receivedSignature, 'hex')
        const expectedBuffer = Buffer.from(expectedSignature, 'hex')
        
        if(!timingSafeEqual(receivedBuffer, expectedBuffer)) {
            throw new ApiError(401, 'Invalid Github signature')
        }

        if(event !== 'push') {
            return null;
        }

        let payload;
        try {
            payload = JSON.parse(rawBodyValidation.data.toString("utf8"));
        } catch {
            throw new ApiError(400, "Webhook body must contain valid JSON");
        }

        const validation = GithubWebhookValidator.pushPayloadSchema.safeParse(payload);
        if (!validation.success) {
            throw new ApiError(400, "Invalid GitHub push payload", validation.error.issues);
        }

        const repository = validation.data.repository.full_name;
        const pusher = validation.data.pusher?.name || "Someone";
        const commitCount = validation.data.commits.length;

        const message = await Message.create({
            conversationId: integration.conversationId,
            senderId: integration.createdBy,
            text: `GitHub: ${pusher} pushed ${commitCount} commit(s) to ${repository}.`,
        });

        await Conversation.findByIdAndUpdate(integration.conversationId, {
        $set: { lastMessage: message._id },
        });

        await message.populate("senderId", "name email");

        const conversation = await Conversation.findById(integration.conversationId);

        for (const memberId of conversation.memberIds) {
            io.to(constants.USER_ROOM(memberId.toString())).emit("dm:new", message);
        }

        return message;
    }
}

export default GithubWebhookService;