import express from "express";
import WebhookController from "../controllers/webhook/webhook.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import GithubWebhookValidator from "../validators/githubWebhook.validator.js";

const webhookRouter = express.Router();

webhookRouter.post(
  "/github/integrations/:conversationId",
  verifyToken,
  validate(GithubWebhookValidator.createSchema),
  WebhookController.createGithubWebhook
);

webhookRouter.post(
  "/github/:integrationId",
  validate(GithubWebhookValidator.receiveSchema),
  WebhookController.receiveGithubWebhook
);

export default webhookRouter;