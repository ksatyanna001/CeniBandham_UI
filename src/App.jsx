import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import Login from './Login.jsx'
import Register from './register.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

export default App
