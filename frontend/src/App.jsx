import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import EmployeeList from './components/EmployeeList'
import TaskList from './components/TaskList'
import AuthPage from './components/AuthPage'
import './App.css'
import { useAuth } from './context/AuthContext.jsx'

export default function App() {
  const { user, isAdmin } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    if (!user) {
      setCurrentPage('dashboard')
    } else if (!isAdmin) {
      setCurrentPage('tasks')
    }
  }, [user, isAdmin])

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'dashboard' && isAdmin && <Dashboard />}
        {currentPage === 'employees' && isAdmin && <EmployeeList />}
        {currentPage === 'tasks' && <TaskList />}
        {!isAdmin && currentPage !== 'tasks' && (
          <div className="access-message">This section is restricted to administrators.</div>
        )}
      </main>
      <footer className="app-footer">
        <p>Employee Task Tracker © 2025 | All rights reserved</p>
      </footer>
    </div>
  )
}
