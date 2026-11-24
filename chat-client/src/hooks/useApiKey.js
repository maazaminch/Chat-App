import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiKeyServices } from "@/services/apiKeyServices";

export const useApiKey = () => {
  const queryClient = useQueryClient();

  const status = useQuery({
    queryKey: ["apiKeyStatus"],
    queryFn: apiKeyServices.getStatus,
    retry: false,
  });

  const generate = useMutation({
    mutationFn: apiKeyServices.generate,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["apiKeyStatus"] });
      toast.success(response.message || "API key generated");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to generate API key");
    },
  });

  const revoke = useMutation({
    mutationFn: apiKeyServices.revoke,
    onSuccess: async (response) => {
      generate.reset();
      await queryClient.invalidateQueries({ queryKey: ["apiKeyStatus"] });
      toast.success(response.message || "API key revoked");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to revoke API key");
    },
  });

  return { status, generate, revoke };
};
