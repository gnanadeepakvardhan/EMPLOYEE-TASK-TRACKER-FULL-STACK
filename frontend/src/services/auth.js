import apiClient from './api'

const AUTH_TOKEN_KEY = 'authToken'
const AUTH_USER_KEY = 'authUser'

const setToken = (token) => {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_KEY)
}

const setUser = (user) => {
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(AUTH_USER_KEY)
}

export const login = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password })
  const { token, data } = res.data
  setToken(token)
  setUser(data)
  return data
}

export const register = async ({ email, password, role = 'user', employeeId }) => {
  const payload = { email, password, role }
  if (role === 'user') {
    payload.employeeId = employeeId
  }
  const res = await apiClient.post('/auth/register', payload)
  const { token, data } = res.data
  setToken(token)
  setUser(data)
  return data
}

export const logout = () => {
  setToken(null)
  setUser(null)
}

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY)
export const getUser = () => {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export default { login, register, logout, getToken, getUser }
