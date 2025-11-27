import { useState } from 'react'
import { employeeAPI } from '../services/api'
import './EmployeeForm.css'

export default function EmployeeForm({ employee, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    employee || {
      name: '',
      email: '',
      department: '',
      position: '',
      status: 'active',
    }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.email || !formData.department || !formData.position) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      if (employee) {
        await employeeAPI.update(employee._id, formData)
      } else {
        await employeeAPI.create(formData)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <h3>{employee ? 'Edit Employee' : 'Add New Employee'}</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
          required
        />
      </div>

      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          required
        />
      </div>

      <div className="form-group">
        <label>Department *</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="e.g., Engineering"
          required
        />
      </div>

      <div className="form-group">
        <label>Position *</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="e.g., Senior Developer"
          required
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : employee ? 'Update' : 'Create'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
