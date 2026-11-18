import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Refresh token mutex to prevent multiple simultaneous refresh calls
let isRefreshing = false
let refreshSubscribers = []

// Add subscriber to queue when refresh is in progress
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

// Notify all subscribers when refresh is complete
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

// 1. Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }

  return config
})

// 2. Return only response.data, and handle expired access token
api.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response.data;
    }
    // Backend sends: { statusCode, data: { ... }, message }
    // We want to return: { ...data, message }
    return {
      ...response.data.data,
      message: response.data.message
    }
  },

  async (error) => {
    const originalRequest = error.config

    const isAuthRequest = ['/auth/login', '/auth/register', '/auth/refresh-token'].some(
      (path) => originalRequest?.url?.includes(path)
    )

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Plain axios (not api), so this request skips these interceptors
        const response = await axios.post(
          'http://localhost:8000/api/v1/auth/refresh-token',
          {},
          { withCredentials: true }
        )

        const newToken = response.data.data.accessToken

        localStorage.setItem('accessToken', newToken)
        isRefreshing = false
        onTokenRefreshed(newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        refreshSubscribers = []
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Backend message stays available in error.response.data.message
    // (formatError reads it in your hooks)
    return Promise.reject(error)
  }
)

export default api