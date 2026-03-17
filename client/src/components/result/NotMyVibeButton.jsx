import { useState } from 'react'
import { DOMAIN_NAMES, DOMAIN_COLORS } from '../../lib/constants'
import { supabase } from '../../lib/supabase'

const REJECTION_REASONS = [
  { key: 'salary', label: 'The salary is too low for a fresher' },
  { key: 'enjoyment', label: "I don't think I'd enjoy the work" },
  { key: 'timeline', label: 'The timeline is too long' },
  { key: 'other', label: 'Something else feels off' },
]

const ALT_SUGGESTIONS = {
  salary: {
    business: 'cloud',
    design: 'cloud',
    networking: 'cloud',
    iot: 'devops',
    devrel: 'genai',
    data: 'genai',
  },
  timeline: {
    ai: 'data',
    fullstack: 'cloud',
    blockchain: 'genai',
    cyber: 'cloud',
  },
  enjoyment: {
    business: 'data',
    design: 'devrel',
    networking: 'devops',
    cloud: 'fullstack',
    data: 'genai',
  },
}

function getAlternate(reason, domain, secondDomain) {
  const map = ALT_SUGGESTIONS[reason]
  if (map && map[domain]) return map[domain]
  if (secondDomain && secondDomain !== domain) return secondDomain
  return domain === 'cloud' ? 'genai' : 'cloud'
}

const ALT_REASONS = {
  salary: (alt) => `${DOMAIN_NAMES[alt]} has stronger fresher-level compensation and faster ramp-up to earning.`,
  timeline: (alt) => `${DOMAIN_NAMES[alt]} gets you job-ready faster while building transferable skills.`,
  enjoyment: (alt) => `${DOMAIN_NAMES[alt]} uses similar core skills but in a different context that might suit you better.`,
  other: (alt) => `${DOMAIN_NAMES[alt]} is a strong alternative that aligns with your profile.`,
}

export default function NotMyVibeButton({ domain, secondDomain, sessionId }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [altDomain, setAltDomain] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = async (reason) => {
    setSelected(reason)
    const alt = getAlternate(reason, domain, secondDomain)
    setAltDomain(alt)
    setSubmitted(true)

    // Log to Supabase
    if (sessionId && !sessionId.startsWith('local-')) {
      try {
        await supabase
          .from('quiz_sessions')
          .update({
            result_rejected: true,
            rejection_reason: reason,
            alternate_domain_shown: alt,
          })
          .eq('id', sessionId)
      } catch (err) {
        console.error('Failed to log rejection:', err)
      }
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs underline cursor-pointer"
        style={{ color: 'var(--muted)', background: 'none', border: 'none', padding: 0 }}
      >
        This doesn't feel right →
      </button>
    )
  }

  return (
    <div className="card p-5 fade-in">
      {!submitted ? (
        <>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
            Tell us what feels off:
          </p>
          <div className="space-y-2">
            {REJECTION_REASONS.map(r => (
              <button
                key={r.key}
                onClick={() => handleSelect(r.key)}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--muted2)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.target.style.borderColor = DOMAIN_COLORS[domain]}
                onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="fade-in">
          <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
            Given that, here's another path that might fit better:
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: DOMAIN_COLORS[altDomain] }}
            />
            <span className="text-base font-semibold" style={{ color: DOMAIN_COLORS[altDomain] }}>
              {DOMAIN_NAMES[altDomain]}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted2)' }}>
            {ALT_REASONS[selected]?.(altDomain) || ALT_REASONS.other(altDomain)}
          </p>
        </div>
      )}
    </div>
  )
}
