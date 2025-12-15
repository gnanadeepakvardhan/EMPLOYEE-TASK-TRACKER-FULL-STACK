import { useState, useEffect, useCallback } from 'react'
import { taskAPI, employeeAPI } from '../services/api'
import TaskForm from './TaskForm'
import './TaskList.css'
import { useAuth } from '../context/AuthContext.jsx'

export default function TaskList() {
  const { user, isAdmin, employeeProfile } = useAuth()

  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEmployee, setFilterEmployee] = useState('all')

  // Load employees ONLY for admin
  useEffect(() => {
    const loadEmployees = async () => {
      if (!isAdmin) return
      try {
        const data = await employeeAPI.getAll()
        setEmployees(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadEmployees()
  }, [isAdmin])

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {}
      if (filterStatus !== 'all') filters.status = filterStatus
      if (isAdmin && filterEmployee !== 'all') filters.assignedTo = filterEmployee

      const data = await taskAPI.getAll(filters)
      setTasks(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterEmployee, isAdmin])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  if (loading) return <div className="loading">Loading tasks...</div>

  return (
    <div className="task-list-container">
      <div className="header">
        <div>
          <h2>{isAdmin ? 'All Tasks' : 'My Tasks'}</h2>

          {/* ✅ EMPLOYEE INFO BLOCK (NEW) */}
          {!isAdmin && employeeProfile && (
            <div className="helper-text">
              <p>
                <strong>Name:</strong> {employeeProfile.name}
              </p>
              <p>
                <strong>Department:</strong> {employeeProfile.department}
              </p>
              <p>
                <strong>Position:</strong> {employeeProfile.position}
              </p>
            </div>
          )}
        </div>

        {isAdmin && (
          <button
            className="btn-primary"
            onClick={() => {
              setEditingTask(null)
              setShowForm(!showForm)
            }}
          >
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isAdmin && showForm && (
        <TaskForm
          task={editingTask}
          employees={employees}
          onSave={async () => {
            await loadTasks()
            setShowForm(false)
            setEditingTask(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingTask(null)
          }}
        />
      )}

      <div className="filters">
        <label>Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="awaiting-approval">Awaiting Approval</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks found</div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="task-card">
              <h3>{task.title}</h3>

              {task.description && (
                <p>
                  <strong>Description:</strong> {task.description}
                </p>
              )}

              <p>
                <strong>Assigned To:</strong>{' '}
                {task.assignedTo?.name || employeeProfile?.name || 'You'}
              </p>

              <p>
                <strong>Status:</strong> {task.status}
              </p>

              <p>
                <strong>Priority:</strong> {task.priority}
              </p>

              <p>
                <strong>Due Date:</strong>{' '}
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
