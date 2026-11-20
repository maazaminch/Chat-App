import express from "express";
import WebhookController from "../webhooks/webhook.controller.js";

const webhookRouter = express.Router();

webhookRouter.post(
    "/:provider",
    WebhookController.receive);

export default webhookRouter;