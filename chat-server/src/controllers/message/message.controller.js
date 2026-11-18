import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import MessageService from "../../services/message.services.js";
import ConvoService from "../../services/convo.services.js";
import constants from "../../sockets/socket-constants/constants.js";
import Message from "../../models/message.model.js";
import { UPLOAD_DIR } from "../../middlewares/upload.middleware.js";


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


    static uploadAttachment = asyncHandler(async(req, res) => {
        if(!req.file) {
            throw new ApiError(400, 'Choose a file to upload')
        }

        const { conversationId } = req.params;

        const savedMessage = await MessageService.uploadAttachment(
            conversationId,
            req.user._id,
            req.body.text,
            {
                originalName: req.file.originalname,
                storageName: req.file.filename,
                mimeType: req.file.mimetype,
                size: req.file.size,
            }
        )

        await savedMessage.populate('senderId', 'name email')
        const conversation = await ConvoService.assertMember(
            conversationId,
            req.user._id
        )

        const recipientId = conversation.memberIds.find(
            (memberId) => memberId.toString() !== req.user._id.toString()
        );

        const io = req.app.get('io')

        if(recipientId) {
            io.to(constants.USER_ROOM(recipientId.toString()))
                .emit('dm:new', savedMessage)
        }

        // Notify the sender's other tabs too. The current tab deduplicates
        // this event by message ID in useChatSocket.
        io.to(constants.USER_ROOM(req.user._id.toString()))
            .emit("dm:new", savedMessage);

        return res.status(201).json(
            new ApiResponse(
                201,
                { savedMessage },
                'Attachment sent successfully'
            )
        )    
    })

    static getAttachment = asyncHandler(async (req, res) => {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);

        if (!message?.attachment) {
            throw new ApiError(404, "Attachment not found");
        }

        await ConvoService.assertMember(message.conversationId, req.user._id);

        return res.sendFile(message.attachment.storageName, {
            root: UPLOAD_DIR,
            headers: {
                "Content-Type": message.attachment.mimeType,
                "Content-Disposition": "inline",
            },
        });
    });


}

export default MessageController;