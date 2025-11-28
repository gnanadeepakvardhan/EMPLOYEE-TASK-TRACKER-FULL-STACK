import { useEffect, useState } from 'react'
import { employeeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'
import './AuthPage.css'

const initialForm = {
  email: '',
  password: '',
  confirmPassword: '',
  employeeId: '',
}

export default function AuthPage() {
  const { login, register, authLoading, authError, setAuthError } = useAuth()
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState(initialForm)
  const [employees, setEmployees] = useState([])
  const [localError, setLocalError] = useState(null)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [hasLoadedEmployees, setHasLoadedEmployees] = useState(false)

  useEffect(() => {
    setLocalError(null)
    setAuthError?.(null)
    setFormData(initialForm)
    if (mode === 'register' && !hasLoadedEmployees) {
      fetchEmployees()
    }
  }, [mode, hasLoadedEmployees, setAuthError])

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const data = await employeeAPI.getAll()
      setEmployees(data)
      setHasLoadedEmployees(true)
    } catch (error) {
      setLocalError('Failed to load employees')
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    setAuthError?.(null)

    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required')
      return
    }

    if (mode === 'login') {
      await login(formData.email, formData.password)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (!formData.employeeId) {
      setLocalError('Select an employee to link this account to')
      return
    }

    await register({
      email: formData.email,
      password: formData.password,
      employeeId: formData.employeeId,
      role: 'user',
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Employee Task Tracker</h1>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Link to Employee</label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled={loadingEmployees}
                  required
                >
                  <option value="">{loadingEmployees ? 'Loading...' : 'Select employee'}</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} — {emp.email}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(localError || authError) && <div className="error-message">{localError || authError}</div>}

          <button type="submit" className="btn-primary" disabled={authLoading}>
            {authLoading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

