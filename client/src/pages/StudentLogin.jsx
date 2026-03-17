import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/ui/Logo'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function StudentLogin({ defaultSignUp = false }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(defaultSignUp || searchParams.get('signup') === 'true')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Pre-fill from quiz result redirect
  const sessionId = searchParams.get('session')
  const domain = searchParams.get('domain')
  const profile = searchParams.get('profile')

  const switchMode = (toSignUp) => {
    setIsSignUp(toSignUp)
    setError(null)
    setSuccessMsg(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
        if (signUpErr) throw signUpErr

        // Create student record
        if (authData.user) {
          await supabase.from('students').insert({
            id: authData.user.id,
            email,
            name,
            quiz_session_id: sessionId || null,
            domain: domain || null,
            profile_type: profile || null,
          })
        }

        setSuccessMsg('Check your email to confirm your account.')
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

  const inputStyle = {
    backgroundColor: 'var(--surface2)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    width: '100%',
    padding: '0.55rem 0.75rem',
    fontSize: '0.875rem',
    transition: 'border-color 0.15s',
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <Link to="/" className="no-underline"><Logo height={28} /></Link>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="card p-8">
            {/* Tab switcher */}
            <div
              className="flex rounded-lg mb-7 p-1"
              style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)' }}
            >
              {['login', 'signup'].map((tab) => {
                const active = tab === 'signup' ? isSignUp : !isSignUp
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => switchMode(tab === 'signup')}
                    className="flex-1 py-1.5 text-sm font-semibold rounded-md transition-all duration-200"
                    style={{
                      backgroundColor: active ? 'var(--surface3, var(--bg))' : 'transparent',
                      color: active ? 'var(--text)' : 'var(--muted)',
                      border: active ? '1px solid var(--border)' : '1px solid transparent',
                    }}
                  >
                    {tab === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                )
              })}
            </div>

            <h2 className="text-xl font-[800] mb-1 tracking-tight" style={{ color: 'var(--text)' }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              {isSignUp
                ? 'Save your roadmap and track your progress.'
                : 'Sign in to access your dashboard.'}
            </p>

            {successMsg && (
              <div
                className="rounded-lg px-4 py-3 mb-5 text-sm"
                style={{ backgroundColor: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)', color: 'var(--accent)' }}
              >
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    style={inputStyle}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                    Password
                  </label>
                  {!isSignUp && (
                    <Link
                      to="/forgot-password"
                      className="text-xs no-underline hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Repeat your password"
                      style={{ ...inputStyle, paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs" style={{ color: '#f43f5e' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !!successMsg}
                className="btn-primary w-full mt-1"
                style={{ opacity: loading || successMsg ? 0.6 : 1 }}
              >
                {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Below card */}
          <p className="text-xs text-center mt-5" style={{ color: 'var(--muted)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => switchMode(!isSignUp)}
              className="underline cursor-pointer"
              style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}
            >
              {isSignUp ? 'Log in' : 'Sign up free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

