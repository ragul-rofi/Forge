import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import StudentLogin from './pages/StudentLogin'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import StudentDashboard from './pages/dashboard/StudentDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result/:sessionId" element={<Result />} />
      {/* Auth routes */}
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/signup" element={<StudentLogin defaultSignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Legacy redirect */}
      <Route path="/login-student" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
