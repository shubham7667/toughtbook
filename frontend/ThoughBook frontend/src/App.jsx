import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import FrontPage from './components/pages/FrontPage'
import LoginPage from './components/pages/loginPage'
import Dashboard from './components/pages/dashboard'
import AdminLogin from './components/pages/AdminLogin.jsx'
import AdminDashboard from './components/pages/AdminDashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/feed" element={<FrontPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App