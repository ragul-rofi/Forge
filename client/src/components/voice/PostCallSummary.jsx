import { CheckCircle } from 'lucide-react'
import { DOMAIN_COLORS } from '../../lib/constants'

export default function PostCallSummary({ student, callData, domain }) {
  const domainColor = DOMAIN_COLORS[domain] || 'var(--accent)'

  return (
    <div className="card p-6 mb-8 text-center" style={{ backgroundColor: 'var(--surface)' }}>
      <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10b981' }} />

      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
        Call Ended
      </h3>

      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        Thanks for talking with SRINI, {student.name}!
      </p>

      <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--muted2)' }}>
          CALL DURATION
        </p>
        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          {formatDuration(callData?.duration || 0)}
        </p>
      </div>

      <div className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
        <p>📧 A summary of your conversation is being sent to your email</p>
        <p className="p-3 rounded" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
          ✅ Any commitments you made will be included
        </p>
        <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}>
          Recording link
        </a>
      </div>

      <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs mb-3" style={{ color: 'var(--muted2)' }}>
          Ready to start your journey?
        </p>
        <a
          href={`/login-student?signup=true&domain=${domain}`}
          className="no-underline inline-block px-4 py-2"
          style={{ backgroundColor: domainColor, color: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}
        >
          View Dashboard →
        </a>
      </div>
    </div>
  )
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
