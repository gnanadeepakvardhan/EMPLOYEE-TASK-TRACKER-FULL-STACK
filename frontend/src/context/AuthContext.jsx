import { createContext, useContext, useState } from 'react'
import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  getUser as getStoredUser,
} from '../services/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser())
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const handleAuth = async (action) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const data = await action()
      setUser(data)
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Authentication failed'
      setAuthError(message)
      return { success: false, message }
    } finally {
      setAuthLoading(false)
    }
  }

  const login = (email, password) => handleAuth(() => loginRequest(email, password))

  const register = (payload) => handleAuth(() => registerRequest(payload))

  const logout = () => {
    logoutRequest()
    setUser(null)
    setAuthError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        authLoading,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

