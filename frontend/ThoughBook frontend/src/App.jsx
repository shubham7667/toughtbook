
import FrontPage from "./components/pages/user_profile"
import LoginPage from "./components/pages/loginPage"
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Dashboard from "./components/pages/user_feed"
import EditProfile from "./components/pages/editProfile"
import ThoughtbookSays from "./components/admin/toughtbook_says"
import AdminUnauthorized from "./components/pages/not_authorize"
import AdminProtectedRoute from "./components/admin/AdminProtectedRoutes"
import UserFeed from "./components/pages/user_feed";
import SearchPage from "./components/pages/SearchPage";
import NotificationsPage from "./components/pages/NotificationsPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/profile" element={<FrontPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/userfeed" element={<Dashboard />} />
        <Route path="/feed" element={<UserFeed />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
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