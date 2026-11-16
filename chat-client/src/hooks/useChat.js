import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatServices } from '../services/chatServices'
import { toast } from 'sonner'

export const useChat = (conversationId = null, searchQuery = null) => {
  const queryClient = useQueryClient()

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: chatServices.createConversation,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['conversations'])
      toast.success(response.message || 'Conversation created successfully')
    },
    onError: () => {
      toast.error('Failed to create conversation')
    }
  })

  // Fetch all conversations (with search)
  const { data: conversations, isLoading: conversationsLoading, error: conversationsError } = useQuery({
    queryKey: ['conversations', searchQuery],
    queryFn: () => chatServices.getConversations(searchQuery),
  })

  // Fetch messages for specific conversation (conditional)
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatServices.getMessages(conversationId),
    enabled: !!conversationId, // Only run when conversationId is provided
  })

  return {
    createConversation: createConversationMutation,

    conversations,
    conversationsLoading,
    conversationsError,

    messages,
    messagesLoading,
    messagesError
  }
}
