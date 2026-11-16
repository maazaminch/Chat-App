import mongoose from "mongoose";

// One-to-one direct message conversation model

const conversationSchema = new mongoose.Schema({
    // Unique key for DM between two users (sorted userIds separated by ':')
    directKey: {
        type: String,
        required: true
    },
    // Array of exactly 2 user IDs
    memberIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    // Reference to the last message in this conversation
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }
}, {
    timestamps: true
});

// Index for faster lookups
conversationSchema.index({ directKey: 1 }, { unique: true });
conversationSchema.index({ memberIds: 1, updatedAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
