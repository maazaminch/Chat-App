import { createHash, randomBytes } from "node:crypto";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

class ApiKeyService {

    static generateApiKey = async (userId) => {
        
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(404, 'User not found')
        }

        const apiKey = `chatapp_${randomBytes(32).toString('hex')}`
        user.apiKeyHash = createHash('sha256')
            .update(apiKey)
            .digest('hex')
        user.apiKeyPrefix = apiKey.slice(0,14)
        user.apiKeyCreatedAt = new Date();
        
        await user.save()

        return {
            apiKey,
            apiKeyPrefix: user.apiKeyPrefix,
            createdAt: user.apiKeyCreatedAt
        }
    }

    static findUserForKey = async (apiKey) => {
        const apiKeyHash = createHash('sha256').update(apiKey).digest('hex')
        const user = await User.findOne({ apiKeyHash }).select('-password')

        return user
    }

    static getApiKeyStatus = async (userId) => {
        const user = await User.findById(userId).select("+apiKeyHash");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return {
            active: Boolean(user.apiKeyHash),
            apiKeyPrefix: user.apiKeyPrefix ?? null,
            createdAt: user.apiKeyCreatedAt ?? null
        };
    }

    static revokeApiKey = async (userId) => {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        user.apiKeyHash = null;
        user.apiKeyPrefix = null;
        user.apiKeyCreatedAt = null;

        await user.save();
    }

}

export default ApiKeyService;