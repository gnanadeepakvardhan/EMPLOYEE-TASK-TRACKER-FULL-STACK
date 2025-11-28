import { useState, useEffect, useCallback } from 'react'
import { taskAPI, employeeAPI } from '../services/api'
import TaskForm from './TaskForm'
import './TaskList.css'
import { useAuth } from '../context/AuthContext.jsx'

export default function TaskList() {
  const { user, isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [requestingTaskId, setRequestingTaskId] = useState(null)
  const [requestForm, setRequestForm] = useState({ note: '', attachments: [''] })
  const [actionLoadingId, setActionLoadingId] = useState(null)

  useEffect(() => {
    const loadEmployees = async () => {
      if (!isAdmin) {
        setEmployees([])
        return
      }
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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterEmployee, isAdmin])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      await taskAPI.delete(id)
      await loadTasks()
    } catch (err) {
      setError('Failed to delete task')
      console.error(err)
    }
  }

  const handleSave = async () => {
    await loadTasks()
    setShowForm(false)
    setEditingTask(null)
  }

  const getEmployeeName = (task) => {
    if (task.assignedTo?.name) {
      return task.assignedTo.name
    }
    const employeeId = task.assignedTo?._id || task.assignedTo
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
      case 'awaiting-approval':
        return '#3b82f6'
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
        <div>
          <h2>{isAdmin ? 'All Tasks' : 'My Tasks'}</h2>
          {!isAdmin && (
            <p className="helper-text">
              You can view the tasks assigned to {user?.employee?.name || 'you'} and their status.
            </p>
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
            <option value="awaiting-approval">Awaiting Approval</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {isAdmin && (
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
        )}
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
                  <strong>Assigned To:</strong> {getEmployeeName(task)}
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
              <CompletionWorkflow
                task={task}
                isAdmin={isAdmin}
                requestingTaskId={requestingTaskId}
                setRequestingTaskId={setRequestingTaskId}
                requestForm={requestForm}
                setRequestForm={setRequestForm}
                actionLoadingId={actionLoadingId}
                onRequestSubmit={async (payload) => {
                  try {
                    setActionLoadingId(task._id)
                    await taskAPI.requestCompletion(task._id, payload)
                    setRequestingTaskId(null)
                    setRequestForm({ note: '', attachments: [''] })
                    await loadTasks()
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to request completion review')
                  } finally {
                    setActionLoadingId(null)
                  }
                }}
                onApprove={async (note) => {
                  try {
                    setActionLoadingId(task._id)
                    await taskAPI.approveCompletion(task._id, note)
                    await loadTasks()
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to approve task')
                  } finally {
                    setActionLoadingId(null)
                  }
                }}
                onReject={async (note) => {
                  try {
                    setActionLoadingId(task._id)
                    await taskAPI.rejectCompletion(task._id, note)
                    await loadTasks()
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to reject task')
                  } finally {
                    setActionLoadingId(null)
                  }
                }}
                onEdit={() => {
                  setEditingTask(task)
                  setShowForm(true)
                }}
                onDelete={() => handleDelete(task._id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function CompletionWorkflow({
  task,
  isAdmin,
  requestingTaskId,
  setRequestingTaskId,
  requestForm,
  setRequestForm,
  actionLoadingId,
  onRequestSubmit,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}) {
  const completionRequest = task.completionRequest || {}
  const awaitingApproval = task.status === 'awaiting-approval'
  const rejected = completionRequest.status === 'rejected'
  const showRequestForm = requestingTaskId === task._id
  const canRequestCompletion = !isAdmin && task.status === 'in-progress'

  const handleAttachmentChange = (index, value) => {
    setRequestForm((prev) => {
      const next = [...prev.attachments]
      next[index] = value
      return { ...prev, attachments: next }
    })
  }

  const addAttachmentField = () => {
    setRequestForm((prev) => ({ ...prev, attachments: [...prev.attachments, ''] }))
  }

  const removeAttachmentField = (index) => {
    setRequestForm((prev) => {
      const next = prev.attachments.filter((_, idx) => idx !== index)
      return { ...prev, attachments: next.length ? next : [''] }
    })
  }

  const submitRequest = async () => {
    const attachmentsPayload = requestForm.attachments
      .filter((url) => url && url.trim())
      .map((url, idx) => ({
        name: `Attachment ${idx + 1}`,
        url: url.trim(),
      }))
    await onRequestSubmit({
      note: requestForm.note,
      attachments: attachmentsPayload,
    })
  }

  const handleApproveClick = async () => {
    const note = window.prompt('Optional message for the employee:', 'Looks good!') || 'Approved'
    await onApprove(note)
  }

  const handleRejectClick = async () => {
    const note = window.prompt('Share the reason for rejection (required):')
    if (!note || !note.trim()) {
      alert('A rejection comment is required.')
      return
    }
    await onReject(note.trim())
  }

  return (
    <>
      <div className="completion-section">
        {awaitingApproval && (
          <div className="request-banner awaiting">
            <span>Awaiting admin approval</span>
          </div>
        )}
        {rejected && (
          <div className="request-banner rejected">
            <span>Last request rejected</span>
          </div>
        )}

        {(awaitingApproval || completionRequest.note) && (
          <div className="request-details">
            {completionRequest.note && (
              <p>
                <strong>Employee note:</strong> {completionRequest.note}
              </p>
            )}
            {completionRequest.attachments?.length > 0 && (
              <div className="attachments-list">
                <strong>Attachments:</strong>
                <ul>
                  {completionRequest.attachments.map((attachment, idx) => (
                    <li key={idx}>
                      <a href={attachment.url} target="_blank" rel="noreferrer">
                        {attachment.name || `Attachment ${idx + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {completionRequest.responseNote && (
              <p className="response-note">
                <strong>Admin response:</strong> {completionRequest.responseNote}
              </p>
            )}
          </div>
        )}

        {!isAdmin && canRequestCompletion && (
          <div className="request-actions">
            <button
              className="btn-primary"
              onClick={() => {
                setRequestingTaskId(task._id)
                setRequestForm({ note: '', attachments: [''] })
              }}
            >
              Request Completion Review
            </button>
          </div>
        )}

        {showRequestForm && (
          <div className="request-form">
            <textarea
              placeholder="Add context for your manager..."
              value={requestForm.note}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, note: e.target.value }))}
              rows={4}
            />
            <div className="attachment-fields">
              <label>Proof / Attachment URLs (optional)</label>
              {requestForm.attachments.map((value, idx) => (
                <div key={idx} className="attachment-row">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={value}
                    onChange={(e) => handleAttachmentChange(idx, e.target.value)}
                  />
                  {requestForm.attachments.length > 1 && (
                    <button type="button" className="btn-link" onClick={() => removeAttachmentField(idx)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-link" onClick={addAttachmentField}>
                + Add another link
              </button>
            </div>
            <div className="request-form-actions">
              <button
                className="btn-primary"
                disabled={actionLoadingId === task._id}
                onClick={submitRequest}
              >
                {actionLoadingId === task._id ? 'Submitting...' : 'Send Request'}
              </button>
              <button className="btn-secondary" onClick={() => setRequestingTaskId(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="task-actions">
          {awaitingApproval ? (
            <>
              <button className="btn-success" disabled={actionLoadingId === task._id} onClick={handleApproveClick}>
                {actionLoadingId === task._id ? 'Approving...' : 'Approve'}
              </button>
              <button className="btn-danger" disabled={actionLoadingId === task._id} onClick={handleRejectClick}>
                {actionLoadingId === task._id ? 'Rejecting...' : 'Reject'}
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={onEdit}>
                Edit
              </button>
              <button className="btn-danger" onClick={onDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
