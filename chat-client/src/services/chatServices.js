import api from '../lib/api.js'

export const chatServices = {

  getConversations: async (searchQuery = '') => {
    const params = searchQuery ? { search: searchQuery } : {}
    const response = await api.get('/convo/get-convo', { params })
    return response
  },

  getMessages: async (convoId) => {
    const response = await api.get(`/message/get-messages/${convoId}`)
    return response
  },

  createConversation: async (userId) => {
    const response = await api.post(`/convo/create-convo/${userId}`)
    return response
  },

  addConversationIntegration: async ({ conversationId, provider, resourceId, events }) => {
    const response = await api.post(`/convo/integrations/${conversationId}`, {
      provider,
      resourceId,
      events,
    })
    return response
  },

  removeConversationIntegration: async ({ conversationId, provider, resourceId }) => {
    const response = await api.delete(`/convo/integrations/${conversationId}`, {
      data: { provider, resourceId },
    })
    return response
  },

  uploadAttachment: async (conversationId, file, text = '') => {
    const formData = new FormData();
    formData.append('file', file)
    formData.append('text', text)

    const response = await api.post(`/message/upload-attachment/${conversationId}`, formData)
    return response
  },

  getAttachment: async (messageId) => {
    const response = await api.get(`/message/get-attachment/${messageId}`, { responseType: 'blob' })
    return  response
  }
}
