import { createContext, useContext, useState, useEffect } from 'react'
import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  getUser as getStoredUser,
} from '../services/auth'
import { employeeAPI } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser())
  const [employeeProfile, setEmployeeProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  /**
   * Fetch employee profile for logged-in employees
   */
  useEffect(() => {
    const loadEmployeeProfile = async () => {
      if (user?.role === 'user' && user?.employee) {
        try {
          const emp = await employeeAPI.getById(user.employee)
          setEmployeeProfile(emp)
        } catch (err) {
          console.error('Failed to load employee profile')
          setEmployeeProfile(null)
        }
      } else {
        setEmployeeProfile(null)
      }
    }

    loadEmployeeProfile()
  }, [user])

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

  const login = (email, password) =>
    handleAuth(() => loginRequest(email, password))

  const register = (payload) =>
    handleAuth(() => registerRequest(payload))

  const logout = () => {
    logoutRequest()
    setUser(null)
    setEmployeeProfile(null)
    setAuthError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        employeeProfile, // 👈 NEW
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
