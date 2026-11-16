import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { authServices } from '@/services/authServices'

export const useSocket = () => {

  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setConnectionError('No authentication token found')
      return
    }

    const newSocket = io(
      import.meta.env.VITE_API_URL || 'http://localhost:8000',
      {
        auth: { token },
        withCredentials: true,
        autoConnect: false
      }
    )
    socketRef.current = newSocket
    setSocket(newSocket)

    const handleConnect = () => {
      setIsConnected(true)
      setConnectionError('')
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleConnectError = async (error) => {
      setIsConnected(false)

      if(error.message.includes('Unauthorized')) {
        try {
          const response = await authServices.refreshToken()
          localStorage.setItem('accessToken', response.accessToken)

          // Clean up old socket
          newSocket.off('connect', handleConnect)
          newSocket.off('disconnect', handleDisconnect)
          newSocket.off('connect_error', handleConnectError)
          newSocket.disconnect()

          // Create new socket with fresh token
          const updatedSocket = io(
            import.meta.env.VITE_API_URL || 'http://localhost:8000',
            {
              auth: { token: response.accessToken },
              withCredentials: true,
              autoConnect: false
            }
          )
          socketRef.current = updatedSocket
          setSocket(updatedSocket)

          // Re-attach event listeners to new socket
          updatedSocket.on('connect', handleConnect)
          updatedSocket.on('disconnect', handleDisconnect)
          updatedSocket.on('connect_error', handleConnectError)
          updatedSocket.connect()
        } catch (refreshError) {
          setConnectionError('Failed to refresh token')
          localStorage.removeItem('accessToken')
          window.location.href = '/login'
        }
      } else {
        setConnectionError(error.message)
      }
    }

    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.on('connect_error', handleConnectError)
    newSocket.connect()

    return () => {
      newSocket.off('connect', handleConnect)
      newSocket.off('disconnect', handleDisconnect)
      newSocket.off('connect_error', handleConnectError)
      newSocket.disconnect()
    }

  }, [])

  return {
    socket,
    isConnected,
    connectionError
  }
}
