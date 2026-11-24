import api from "../lib/api.js";

export const apiKeyServices = {
  getStatus: async () => {
    const response = await api.get("/api-keys/status");
    return response;
  },

  generate: async () => {
    const response = await api.post("/api-keys/generate-apikey");
    return response;
  },

  revoke: async () => {
    const response = await api.delete("/api-keys/revoke-apikey");
    return response;
  },
};
