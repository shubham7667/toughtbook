
import FrontPage from "./components/pages/FrontPage"
import LoginPage from "./components/pages/loginPage"
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Dashboard from "./components/pages/dashboard"
import EditProfile from "./components/pages/editProfile"
import ThoughtbookSays from "./components/admin/toughtbook_says"
import AdminUnauthorized from "./components/pages/not_authorize"
import AdminProtectedRoute from "./components/admin/AdminProtectedRoutes"
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/feed" element={<FrontPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit_profile" element={<EditProfile />} />
        <Route element={<AdminProtectedRoute />}>
          <Route
            path="/thought_says"
            element={<ThoughtbookSays />}
          />
        </Route>
        <Route path="/unauthorized" element={<AdminUnauthorized />} />


      </Routes>

    </BrowserRouter>

  )
}

export default App
