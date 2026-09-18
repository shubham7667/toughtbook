
import FrontPage from "./components/pages/FrontPage"
import LoginPage from "./components/pages/loginPage"
import {BrowserRouter, Navigate, Routes, Route} from 'react-router-dom'
import Dashboard from "./components/pages/dashboard"

function App() {
  return (
    <BrowserRouter>
    <Routes>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/feed" element={<FrontPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
      
    </Routes>
    
    </BrowserRouter>
 
  )
}

export default App
