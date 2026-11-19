import api from "../lib/api.js";

export const webhookServices = {
  createGithubWebhook: async (conversationId) => {
    return api.post(`/webhooks/github/integrations/${conversationId}`);
  },
};
