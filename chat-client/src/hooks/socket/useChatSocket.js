import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const addMessage = (current, message) => {
  const messages = current?.messages ?? []

  if (messages.some((item) => item._id === message._id)) {
    return current
  }

  return {
    ...current,
    messages: [...messages, message],
  }
}

export const useChatSocket = (socket, conversationId) => {
  const queryClient = useQueryClient()
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      const messageConversationId =
        message.conversationId?._id ?? message.conversationId

      queryClient.invalidateQueries({ queryKey: ['conversations'] })

      if (String(messageConversationId) === String(conversationId)) {
        queryClient.setQueryData(['messages', conversationId],
          (current) => addMessage(current, message)
        )
      } else {
        queryClient.invalidateQueries({
          queryKey: ['messages', messageConversationId],
        })
      }
    }

    // Client listens to new message
    socket.on('dm:new', handleNewMessage)
    return () => socket.off('dm:new', handleNewMessage)
  }, [socket, conversationId, queryClient])




  const sendMessage = (text, onSent) => {
    if (!socket?.connected) {
      toast.error('Not connected to chat. Please try again.')
      return
    }

    setIsSending(true)
    // Client emit message
    socket.timeout(10000).emit(
      'dm:send',
      { conversationId, text },
      (timeoutError, response) => {
        setIsSending(false)

        if (timeoutError) {
          toast.error('The chat server did not respond. Please try again.')
          return
        }

        if (!response?.ok) {
          toast.error(response?.error || 'Could not send message.')
          return
        }

        queryClient.setQueryData(
          ['messages', conversationId],
          (current) => addMessage(current, response.message)
        )
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
        onSent?.()
      }
    )
  }

  return { sendMessage, isSending }
}
