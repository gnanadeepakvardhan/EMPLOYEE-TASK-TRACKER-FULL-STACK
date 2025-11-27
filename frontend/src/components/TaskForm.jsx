import { useState } from 'react'
import { taskAPI } from '../services/api'
import './TaskForm.css'

export default function TaskForm({ task, employees, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    task || {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
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

    if (!formData.title || !formData.assignedTo || !formData.dueDate) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      if (task) {
        await taskAPI.update(task._id, formData)
      } else {
        await taskAPI.create(formData)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{task ? 'Edit Task' : 'Add New Task'}</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description"
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Assigned To *</label>
          <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} required>
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Due Date *</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate.split('T')[0]}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : task ? 'Update' : 'Create'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
