import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authServices } from '../services/authServices'
import { formatError } from '../lib/utils'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const hasToken = !!localStorage.getItem('accessToken')

  // Current user (server state, lives in React Query)
  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: authServices.getMe,
    enabled: hasToken, // don't call /me if there is no token
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: authServices.login,
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.accessToken)
      queryClient.setQueryData(['me'], { user: response.user })
      toast.success(response?.message || 'Logged in successfully')
      navigate('/chat')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const registerMutation = useMutation({
    mutationFn: authServices.register,
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.accessToken)
      queryClient.setQueryData(['me'], { user: response.user })
      toast.success(response?.message || 'Account created successfully')
      navigate('/chat')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authServices.logout,
    onSettled: () => {
      // runs on success AND failure: always log out locally
      localStorage.removeItem('accessToken')
      queryClient.clear()
      navigate('/login')
    },
  })

  return {
    user: data?.user || null,
    isAuthenticated: hasToken && !!data?.user,
    isLoading,
    error,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  }
}