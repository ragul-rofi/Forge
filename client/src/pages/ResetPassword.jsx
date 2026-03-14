import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/ui/Logo'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // Supabase embeds the recovery tokens in the URL hash.
  // Listening to onAuthStateChange picks up the SIGNED_IN event from the hash.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password })
      if (updateErr) throw updateErr
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 2500)
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
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <Link to="/" className="no-underline"><Logo height={28} /></Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="card p-8">
            {done ? (
              <div className="text-center">
                <h2 className="text-xl font-[800] tracking-tight mb-2" style={{ color: 'var(--text)' }}>
                  Password updated
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  You're all set. Redirecting to your dashboard…
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-[800] tracking-tight mb-1" style={{ color: 'var(--text)' }}>
                  Set a new password
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                  Choose something strong — at least 6 characters.
                </p>

                {!sessionReady && (
                  <div
                    className="rounded-lg px-4 py-3 mb-5 text-sm"
                    style={{ backgroundColor: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', color: '#facc15' }}
                  >
                    Verifying your reset link…
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
                      New Password
                    </label>
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
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

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
                      >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs" style={{ color: '#f43f5e' }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !sessionReady}
                    className="btn-primary w-full"
                    style={{ opacity: loading || !sessionReady ? 0.6 : 1 }}
                  >
                    {loading ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
