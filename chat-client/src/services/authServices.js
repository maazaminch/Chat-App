import api from '../lib/api'

export const authServices = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token')
    return response
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response
  }
}
