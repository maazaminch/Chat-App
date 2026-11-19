import { useMutation } from "@tanstack/react-query";
import { webhookServices } from "@/services/webhookServices";
import { toast } from "sonner";

export const useGithubWebhook = () => {
  const createGithubWebhookMutation = useMutation({
    mutationFn: webhookServices.createGithubWebhook,
    onSuccess: (response) => {
      toast.success(response.message || "GitHub webhook created");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create GitHub webhook"
      );
    },
  });

  return {
    createGithubWebhook: createGithubWebhookMutation,
  };
};
