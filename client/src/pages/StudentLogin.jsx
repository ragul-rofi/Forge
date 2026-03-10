import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/ui/Logo'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function StudentLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pre-fill from quiz result redirect
  const sessionId = searchParams.get('session')
  const domain = searchParams.get('domain')
  const profile = searchParams.get('profile')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpErr) throw signUpErr

        // Create student record
        if (authData.user) {
          const { error: insertErr } = await supabase.from('students').insert({
            id: authData.user.id,
            email,
            name,
            quiz_session_id: sessionId || null,
            domain: domain || null,
            profile_type: profile || null,
          })
          if (insertErr) throw insertErr
        }

        navigate('/dashboard')
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInErr) throw signInErr
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <Logo height={28} />
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm">
          <h2 className="text-xl font-bold mb-1 text-center" style={{ color: 'var(--text)' }}>
            {isSignUp ? 'Save Your Roadmap' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: 'var(--muted)' }}>
            {isSignUp
              ? 'Create a free account to keep your roadmap permanently.'
              : 'Sign in to access your dashboard.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                  }}
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <p className="text-xs text-center" style={{ color: '#f43f5e' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--muted)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="underline cursor-pointer"
              style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0 }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
