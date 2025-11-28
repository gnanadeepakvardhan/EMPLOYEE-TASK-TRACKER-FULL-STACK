import { useState, useEffect } from 'react'
import { employeeAPI } from '../services/api'
import EmployeeForm from './EmployeeForm'
import './EmployeeList.css'
import { useAuth } from '../context/AuthContext.jsx'

export default function EmployeeList() {
  const { isAdmin } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="restricted-card">
        <h3>Admin Access Required</h3>
        <p>Only administrators can manage employees.</p>
      </div>
    )
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await employeeAPI.getAll()
      setEmployees(data)
    } catch (err) {
      setError('Failed to load employees')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return

    try {
      await employeeAPI.delete(id)
      setEmployees(employees.filter((e) => e._id !== id))
    } catch (err) {
      setError('Failed to delete employee')
      console.error(err)
    }
  }

  const handleSave = async () => {
    await fetchEmployees()
    setShowForm(false)
    setEditingEmployee(null)
  }

  if (loading) return <div className="loading">Loading employees...</div>

  return (
    <div className="employee-list-container">
      <div className="header">
        <h2>Employees</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingEmployee(null)
            setShowForm(!showForm)
          }}
        >
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingEmployee(null)
          }}
        />
      )}

      <div className="employees-grid">
        {employees.length === 0 ? (
          <div className="empty-state">No employees found. Add one to get started!</div>
        ) : (
          employees.map((employee) => (
            <div key={employee._id} className="employee-card">
              <div className="card-header">
                <h3>{employee.name}</h3>
                <span className={`status ${employee.status}`}>{employee.status}</span>
              </div>
              <div className="card-body">
                <p>
                  <strong>Email:</strong> {employee.email}
                </p>
                <p>
                  <strong>Department:</strong> {employee.department}
                </p>
                <p>
                  <strong>Position:</strong> {employee.position}
                </p>
              </div>
              <div className="card-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingEmployee(employee)
                    setShowForm(true)
                  }}
                >
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(employee._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
