import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './Login.jsx'
import Register from './register.jsx'

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate replace to="/register" />} />
      <Route path="*" element={<Navigate replace to="/register" />} />
    </Routes>
  )
}

export default App
