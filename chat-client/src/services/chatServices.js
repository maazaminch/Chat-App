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
  }
}
