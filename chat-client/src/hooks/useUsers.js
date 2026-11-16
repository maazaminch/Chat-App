import { useQuery } from '@tanstack/react-query'
import { userServices } from '../services/userServices'

export const useUsers = () => {
  // Fetch all users
  const { data: allUsers, isLoading: allUsersLoading, error: allUsersError } = useQuery({
    queryKey: ['users'],
    queryFn: userServices.getAllUsers,
  })

  // Get user by ID (returns a hook that can be called with userId)
  const getUserById = (userId) => {
    return useQuery({
      queryKey: ['user', userId],
      queryFn: () => userServices.getUserById(userId),
      enabled: !!userId, // Only run when userId is provided
    })
  }

  // Search users (returns a hook that can be called with query)
  const searchUsers = (query) => {
    return useQuery({
      queryKey: ['users', 'search', query],
      queryFn: () => userServices.searchUsers(query),
      enabled: !!query && query.length > 0, // Only run when query has text
    })
  }

  return {
    allUsers,
    allUsersLoading,
    allUsersError,
    getUserById,
    searchUsers,
  }
}
