import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import AdminLogin from './pages/admin/Login'
import AdminOverview from './pages/admin/Overview'
import AdminStudents from './pages/admin/Students'
import AdminQuestions from './pages/admin/Questions'
import AdminAnalytics from './pages/admin/Analytics'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result/:sessionId" element={<Result />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
