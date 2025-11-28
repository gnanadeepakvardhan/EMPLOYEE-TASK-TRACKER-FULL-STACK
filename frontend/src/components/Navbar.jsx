import './Navbar.css'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar({ currentPage, onPageChange }) {
  const { user, isAdmin, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>📋 Task Tracker</h1>
        </div>
        <div className="navbar-content">
          <ul className="navbar-menu">
            {isAdmin && (
              <>
                <li>
                  <button
                    className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onPageChange('dashboard')}
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-link ${currentPage === 'employees' ? 'active' : ''}`}
                    onClick={() => onPageChange('employees')}
                  >
                    Employees
                  </button>
                </li>
              </>
            )}
            <li>
              <button
                className={`nav-link ${currentPage === 'tasks' ? 'active' : ''}`}
                onClick={() => onPageChange('tasks')}
              >
                {isAdmin ? 'Tasks' : 'My Tasks'}
              </button>
            </li>
          </ul>
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <span className="user-role">{isAdmin ? 'Administrator' : 'Employee'}</span>
            </div>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
