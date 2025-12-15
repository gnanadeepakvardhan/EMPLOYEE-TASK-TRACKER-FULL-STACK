import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token from localStorage (if present)
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('authToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (e) {
    // ignore
  }
  return config
})

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============ EMPLOYEE API ============

export const employeeAPI = {
  getAll: async () => {
    const response = await apiClient.get('/employees')
    return response.data.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/employees/${id}`)
    return response.data.data
  },

  create: async (employeeData) => {
    const response = await apiClient.post('/employees', employeeData)
    return response.data.data
  },

  update: async (id, employeeData) => {
    const response = await apiClient.put(`/employees/${id}`, employeeData)
    return response.data.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/employees/${id}`)
    return response.data.data
  },
}

// ============ TASK API ============

export const taskAPI = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/tasks', { params: filters })
    return response.data.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/tasks/${id}`)
    return response.data.data
  },

  create: async (taskData) => {
    const response = await apiClient.post('/tasks', taskData)
    return response.data.data
  },

  update: async (id, taskData) => {
    const response = await apiClient.put(`/tasks/${id}`, taskData)
    return response.data.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`)
    return response.data.data
  },

  getByEmployee: async (employeeId) => {
    const response = await apiClient.get('/tasks', {
      params: { assignedTo: employeeId },
    })
    return response.data.data
  },

  getByStatus: async (status) => {
    const response = await apiClient.get('/tasks', {
      params: { status },
    })
    return response.data.data
  },

  requestCompletion: async (id, payload) => {
    const response = await apiClient.post(`/tasks/${id}/request-completion`, payload)
    return response.data.data
  },

  approveCompletion: async (id, responseNote) => {
    const response = await apiClient.post(`/tasks/${id}/approve-completion`, { responseNote })
    return response.data.data
  },

  rejectCompletion: async (id, responseNote) => {
    const response = await apiClient.post(`/tasks/${id}/reject-completion`, { responseNote })
    return response.data.data
  },
}

// ============ DASHBOARD API ============

export const dashboardAPI = {
  getSummary: async () => {
    const response = await apiClient.get('/dashboard')
    return response.data.data
  },
}

export default apiClient
