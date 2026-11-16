import api from '../lib/api.js'

export const userServices = {
  
    getAllUsers: async () => {
    const response = await api.get('/user/get-users')
    return response
    },

    getUserById: async (userId) => {
        const response = await api.get(`/user/get-user/${userId}`)
        return response
    },

    searchUsers: async (query) => {
        const response = await api.get(`/user/search-users?q=${query}`)
        return response
    }

}


