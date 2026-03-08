import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Students from './pages/Students'
import Questions from './pages/Questions'
import Analytics from './pages/Analytics'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="students" element={<Students />} />
        <Route path="questions" element={<Questions />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
