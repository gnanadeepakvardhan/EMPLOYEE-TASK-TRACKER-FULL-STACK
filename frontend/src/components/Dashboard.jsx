import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { employeeProfile, isAdmin } = useAuth()

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
    // Refresh dashboard every 30 seconds
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboard = async () => {
    try {
      setError(null)
      const data = await dashboardAPI.getSummary()
      setDashboardData(data)
    } catch (err) {
      setError('Failed to load dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>
  if (error) return <div className="error-message">{error}</div>
  if (!dashboardData) return <div className="loading">No data available</div>

  const { summary, tasksByPriority, tasksByEmployee } = dashboardData

  return (
    <div className="dashboard-container">

      {/* ===== EMPLOYEE PROFILE (only for employees) ===== */}
      {!isAdmin && employeeProfile && (
        <div className="profile-card">
          <h3>My Profile</h3>
          <p><b>Name:</b> {employeeProfile.name}</p>
          <p><b>Email:</b> {employeeProfile.email}</p>
          <p><b>Department:</b> {employeeProfile.department}</p>
          <p><b>Position:</b> {employeeProfile.position}</p>
        </div>
      )}

      <h2>Dashboard</h2>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-content">
            <h4>Total Employees</h4>
            <div className="big-number">{summary.totalEmployees}</div>
          </div>
          <div className="card-icon">👥</div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h4>Total Tasks</h4>
            <div className="big-number">{summary.totalTasks}</div>
          </div>
          <div className="card-icon">📋</div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h4>Completed Tasks</h4>
            <div className="big-number">{summary.completedTasks}</div>
          </div>
          <div className="card-icon">✅</div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h4>Completion Rate</h4>
            <div className="big-number">{summary.completionRate}%</div>
          </div>
          <div className="card-icon">📈</div>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>Task Status Overview</h3>
          <div className="status-breakdown">
            <div className="status-item">
              <span className="status-label">Pending</span>
              <div className="status-bar">
                <div
                  className="status-fill pending"
                  style={{
                    width: `${
                      summary.totalTasks > 0
                        ? (summary.pendingTasks / summary.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="status-count">{summary.pendingTasks}</span>
            </div>

            <div className="status-item">
              <span className="status-label">In Progress</span>
              <div className="status-bar">
                <div
                  className="status-fill in-progress"
                  style={{
                    width: `${
                      summary.totalTasks > 0
                        ? (summary.inProgressTasks / summary.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="status-count">{summary.inProgressTasks}</span>
            </div>

            <div className="status-item">
              <span className="status-label">Awaiting Approval</span>
              <div className="status-bar">
                <div
                  className="status-fill awaiting"
                  style={{
                    width: `${
                      summary.totalTasks > 0
                        ? (summary.awaitingApprovalTasks / summary.totalTasks) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="status-count">
                {summary.awaitingApprovalTasks}
              </span>
            </div>

            <div className="status-item">
              <span className="status-label">Completed</span>
              <div className="status-bar">
                <div
                  className="status-fill completed"
                  style={{
                    width: `${
                      summary.totalTasks > 0
                        ? (summary.completedTasks / summary.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="status-count">{summary.completedTasks}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3>Tasks by Priority</h3>
          <div className="priority-breakdown">
            {Object.entries(tasksByPriority).map(([priority, count]) => (
              <div key={priority} className="priority-item">
                <span className={`priority-badge ${priority}`}>
                  {priority.toUpperCase()}
                </span>
                <span className="count">{count} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="employees-performance">
        <h3>Employee Task Performance</h3>
        <div className="performance-table">
          <div className="table-header">
            <div className="col-name">Employee</div>
            <div className="col-tasks">Total Tasks</div>
            <div className="col-completed">Completed</div>
            <div className="col-rate">Completion Rate</div>
          </div>

          <div className="table-body">
            {tasksByEmployee.length === 0 ? (
              <div className="empty-row">No employee data available</div>
            ) : (
              tasksByEmployee.map((emp) => (
                <div key={emp._id} className="table-row">
                  <div className="col-name">{emp.employeeName}</div>
                  <div className="col-tasks">{emp.totalTasks}</div>
                  <div className="col-completed">{emp.completedTasks}</div>
                  <div className="col-rate">
                    <div className="rate-display">
                      <div className="rate-bar">
                        <div
                          className="rate-fill"
                          style={{ width: `${emp.completionRate}%` }}
                        ></div>
                      </div>
                      <span>{emp.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
