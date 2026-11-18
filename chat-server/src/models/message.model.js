import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    storageName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    attachment: {
        type: attachmentSchema,
        default: undefined
    }
}, {
    timestamps: true
});

messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;