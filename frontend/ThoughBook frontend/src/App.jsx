import FrontPage from "./components/pages/FrontPage"
import LoginPage from "./components/pages/loginPage"
import {BrowserRouter,Routes,Route} from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
    <Routes>

      <Route path="/" element={<FrontPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
    </Routes>
    
    </BrowserRouter>
 
  )
}

export default App
