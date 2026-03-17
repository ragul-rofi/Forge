import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/ui/Logo'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetErr) throw resetErr
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <Link to="/" className="no-underline"><Logo height={28} /></Link>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="card p-8">
            {sent ? (
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)' }}
                >
                  <Mail size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="text-xl font-[800] tracking-tight mb-2" style={{ color: 'var(--text)' }}>
                  Check your inbox
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                  We sent a password reset link to <span style={{ color: 'var(--text)' }}>{email}</span>. It expires in 1 hour.
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Didn't get it? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="underline cursor-pointer"
                    style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}
                  >
                    try again
                  </button>
                  .
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-[800] tracking-tight mb-1" style={{ color: 'var(--text)' }}>
                  Reset your password
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                  Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      style={{
                        backgroundColor: 'var(--surface2)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none',
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  {error && (
                    <p className="text-xs" style={{ color: '#f43f5e' }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                    style={{ opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}
          </div>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 mt-5 text-xs no-underline hover:underline"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft size={12} />
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
