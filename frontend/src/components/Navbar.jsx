import './Navbar.css'

export default function Navbar({ currentPage, onPageChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>📋 Task Tracker</h1>
        </div>
        <ul className="navbar-menu">
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
          <li>
            <button
              className={`nav-link ${currentPage === 'tasks' ? 'active' : ''}`}
              onClick={() => onPageChange('tasks')}
            >
              Tasks
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
