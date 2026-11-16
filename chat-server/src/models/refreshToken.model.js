import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        hashedToken: {
            type: String,
            required: true,
            unique: true,
        },
        familyId: {
            type: String,
            required: true,
            index: true,
        },
        usedAt: {
            type: Date,
            default: null,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
        expiredAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
    

// 🗑️ AUTOMATICALLY DELETES EXPIRED TOKENS FROM THE DB
refreshTokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;