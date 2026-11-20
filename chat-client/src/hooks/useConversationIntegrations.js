import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatServices } from "@/services/chatServices";

export const useAddConversationIntegration = (conversationId) => {
  const queryClient = useQueryClient();

  const addIntegrationMutation = useMutation({
    mutationFn: (integration) =>
      chatServices.addConversationIntegration({
        conversationId,
        ...integration,
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success(response.message || "GitHub repository connected");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to connect GitHub repository"
      );
    },
  });

  return {
    addIntegration: addIntegrationMutation,
  };
};
