import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'
import { ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAdmin()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-[800] tracking-tighter" style={{ color: 'var(--text)' }}>
            FORGE
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="font-mono text-xs tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="font-mono text-xs tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: '#f43f5e' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Entering...' : <span className="inline-flex items-center gap-1">Enter <ArrowRight size={16} /></span>}
          </button>
        </form>
      </div>
    </div>
  )
}
