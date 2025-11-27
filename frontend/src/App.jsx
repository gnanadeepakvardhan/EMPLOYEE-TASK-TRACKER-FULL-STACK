import { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import EmployeeList from './components/EmployeeList'
import TaskList from './components/TaskList'
import './App.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'employees' && <EmployeeList />}
        {currentPage === 'tasks' && <TaskList />}
      </main>
      <footer className="app-footer">
        <p>Employee Task Tracker © 2025 | All rights reserved</p>
      </footer>
    </div>
  )
}
