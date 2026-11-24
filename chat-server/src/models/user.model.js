import mongoose from "mongoose";
import { Schema } from "mongoose";
import Roles from "../constants/roles.js";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        role: {
            type: String,
            enum: Object.values(Roles),
            default: Roles.USER,
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        isBanned: {
            type: Boolean,
            default: false,
        },

        // Related to API key gen
        apiKeyHash: {
            type: String,
            index: true,
            select: false
        },
        apiKeyPrefix: String,
        apiKeyCreatedAt: Date
    }, 
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

export default User;