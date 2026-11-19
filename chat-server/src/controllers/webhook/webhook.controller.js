import GithubWebhookService from "../../services/githubWebhook.services.js";
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";



class WebhookController {

    static createGithubWebhook = asyncHandler(async (req, res) => {
        const { conversationId } = req.params;
        const userId = req.user._id;

        const integration = await GithubWebhookService.createWebhook(
            conversationId,
            userId
        )

        return res.status(201).json(
            new ApiResponse(
                201, 
                integration,
                'GitHub webhook created' 
            )
        )
    })


    static receiveGithubWebhook = asyncHandler(async (req, res) => {

        const { integrationId } = req.params;
        const signature = req.get('x-hub-signature-256')
        const event = req.get('x-github-event')
        const rawBody = req.rawBody
        const io = req.app.get('io')

        const message = await GithubWebhookService.receivePush({
            integrationId,
            signature,
            event,
            rawBody,
            io
        })

        return res.status(202).json(
            new ApiResponse(
                202,
                { received: true, ignored: !message},
                message ? 'Github event added to conversation' : 'Event ignored'
            )
        )
    })
}

export default WebhookController;