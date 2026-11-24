import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiKeyService from "../services/apiKey.services.js";


export const apiKeyAuth = asyncHandler(async (req, res, next) => {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer\s+(\S+)$/i);
    const apiKey = match?.[1] || req.get('x-api-key');

    if (!apiKey) {
        throw new ApiError(401, 'API key required');
    }

    const user = await ApiKeyService.findUserForKey(apiKey);
    if (!user) {
        throw new ApiError(401, 'Invalid API key');
    }

    req.user = user;
    next();
});