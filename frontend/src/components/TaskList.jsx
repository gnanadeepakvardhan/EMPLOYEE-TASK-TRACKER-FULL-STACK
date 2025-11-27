import { useState, useEffect } from 'react'
import { taskAPI, employeeAPI } from '../services/api'
import TaskForm from './TaskForm'
import './TaskList.css'

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEmployee, setFilterEmployee] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [filterStatus, filterEmployee])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [tasksData, employeesData] = await Promise.all([
        taskAPI.getAll(),
        employeeAPI.getAll(),
      ])
      setTasks(tasksData)
      setEmployees(employeesData)
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = async () => {
    try {
      const filters = {}
      if (filterStatus !== 'all') filters.status = filterStatus
      if (filterEmployee !== 'all') filters.assignedTo = filterEmployee

      const data = await taskAPI.getAll(filters)
      setTasks(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      await taskAPI.delete(id)
      setTasks(tasks.filter((t) => t._id !== id))
    } catch (err) {
      setError('Failed to delete task')
      console.error(err)
    }
  }

  const handleSave = async () => {
    await fetchData()
    setShowForm(false)
    setEditingTask(null)
  }

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((e) => e._id === employeeId)
    return employee ? employee.name : 'Unknown'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745'
      case 'in-progress':
        return '#ffc107'
      case 'pending':
        return '#6c757d'
      default:
        return '#999'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#dc3545'
      case 'medium':
        return '#ff9800'
      case 'low':
        return '#28a745'
      default:
        return '#999'
    }
  }

  if (loading) return <div className="loading">Loading tasks...</div>

  return (
    <div className="task-list-container">
      <div className="header">
        <h2>Tasks</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingTask(null)
            setShowForm(!showForm)
          }}
        >
          {showForm ? 'Cancel' : '+ Add Task'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <TaskForm
          task={editingTask}
          employees={employees}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingTask(null)
          }}
        />
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by Employee:</label>
          <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
            <option value="all">All</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks found. Create one to get started!</div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <div className="task-title-section">
                  <h3>{task.title}</h3>
                  <div className="task-badges">
                    <span
                      className="badge status"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                    <span
                      className="badge priority"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="task-body">
                {task.description && (
                  <p className="description">
                    <strong>Description:</strong> {task.description}
                  </p>
                )}
                <p>
                  <strong>Assigned To:</strong> {getEmployeeName(task.assignedTo._id || task.assignedTo)}
                </p>
                <p>
                  <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
                </p>
                {task.completedAt && (
                  <p>
                    <strong>Completed:</strong> {new Date(task.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="task-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingTask(task)
                    setShowForm(true)
                  }}
                >
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(task._id)}>
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
