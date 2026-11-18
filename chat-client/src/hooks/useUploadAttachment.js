import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatServices } from "@/services/chatServices";
import { toast } from "sonner";


export const useUploadAttachment = (conversationId) => {
    const queryClient = useQueryClient();

    const uploadAttachmentMutation = useMutation({
        mutationFn: ({ file, text = "" }) =>
            chatServices.uploadAttachment(conversationId, file, text),
        onSuccess: async (response) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["conversations"] }),
                queryClient.invalidateQueries({
                    queryKey: ["messages", conversationId],
                }),
            ]);
            toast.success(response.message || "Attachment uploaded successfully");
        },
        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Failed to upload attachment"
            );
        },
    });


    return {
        uploadAttachment: uploadAttachmentMutation,
    }
}

// it shows the attachment in message bubble
export const useMessageAttachment = (messageId) => {
    const { data: file, isLoading, error } = useQuery({
        queryKey: ['attachment', messageId],
        queryFn: () => chatServices.getAttachment(messageId),
        enabled: !!messageId
    })

    return { file, isLoading, error }
}
