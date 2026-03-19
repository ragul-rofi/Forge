import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getStudentSession, supabase } from '../lib/supabase'
import LoadingDots from './ui/LoadingDots'

export default function StudentProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      try {
        const { data } = await getStudentSession()
        const session = data?.session

        if (!mounted) return

        if (!session?.user?.id) {
          setAuthorized(false)
          setLoading(false)
          return
        }

        await supabase
          .from('students')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()

        setAuthorized(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <LoadingDots />
      </div>
    )
  }

  if (!authorized) {
    return <Navigate to="/login" replace />
  }

  return children
}
