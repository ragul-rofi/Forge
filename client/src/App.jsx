import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Result from './pages/Result'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result/:sessionId" element={<Result />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
