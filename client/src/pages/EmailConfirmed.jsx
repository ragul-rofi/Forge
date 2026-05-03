import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingDots from '../components/ui/LoadingDots'

export default function EmailConfirmed() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Get the session from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      
      if (accessToken) {
        // User is now authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check if there's a pending session ID
          const pendingSessionId = localStorage.getItem('pendingSessionId')
          
          if (pendingSessionId) {
            // Redirect back to their result page
            localStorage.removeItem('pendingSessionId')
            navigate(`/result/${pendingSessionId}`)
          } else {
            // No pending session, go to dashboard
            navigate('/dashboard')
          }
        }
      } else {
        // No token, redirect to login
        navigate('/login')
      }
    }

    handleEmailConfirmation()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="text-center">
        <LoadingDots />
        <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
          Confirming your email...
        </p>
      </div>
    </div>
  )
}
