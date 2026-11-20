import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import WebhookService from "./webhook.service.js";

class WebhookController {
    static receive = asyncHandler(async (req, res) => {
        const result = await WebhookService.receive({
            providerName: req.params.provider,
            headers: req.headers,
            rawBody: req.rawBody,
            io: req.app.get("io"),
        });

        return res.status(202).json(
            new ApiResponse(202, result, "Webhook received!")
        );
    });
}

export default WebhookController;