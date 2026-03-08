import { Navigate } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'
import LoadingDots from './ui/LoadingDots'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <LoadingDots />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
