import { useState } from 'react'
import { DOMAIN_COLORS } from '../../lib/constants'
import { apiUrl } from '../../lib/api'

export default function PhoneCallOption({ student, domain, profile, quizEmotion, roadmap }) {
  const domainColor = DOMAIN_COLORS[domain] || 'var(--accent)'

  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle') // idle | calling | scheduled | error
  const [errorMsg, setErrorMsg] = useState('')

  const requestOutboundCall = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number')
      return
    }

    setStatus('calling')
    setErrorMsg('')

    try {
      const domainContext = buildDomainContext(domain, roadmap)
      const salaryData = buildSalaryData(roadmap?.salary)

      const res = await fetch(apiUrl('/api/srini-call-outbound'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+91${phone}`,
          studentName: student.name,
          studentEmail: student.email,
          domain,
          profileType: profile,
          timeAvailable: student.timeAvailable || '6 months',
          priority: student.priority || 'balanced',
          quizEmotion: quizEmotion || 'curiosity',
          yearOfStudy: student.year || '2nd year',
          domainContext,
          salaryData
        })
      })

      if (res.ok) {
        setStatus('scheduled')
      } else {
        const error = await res.json()
        setErrorMsg(error.error || 'Failed to initiate call')
        setStatus('error')
      }
    } catch (err) {
      console.error('Outbound call error:', err)
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="p-4 rounded-lg" style={{ background: 'var(--surface3)', border: '1px solid var(--border)' }}>
      {status === 'idle' && (
        <>
          <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
            Enter your mobile number:
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm px-3 py-2 rounded" style={{ background: 'var(--surface3)', color: 'var(--muted2)', borderRight: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace' }}>
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              maxLength={10}
              className="flex-1 px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border)'
              }}
            />
            <button
              onClick={requestOutboundCall}
              disabled={phone.length !== 10}
              className="px-4 py-2 rounded text-sm font-medium"
              style={{
                background: phone.length === 10 ? domainColor : 'var(--surface3)',
                color: phone.length === 10 ? 'var(--bg)' : 'var(--muted)',
                opacity: phone.length === 10 ? 1 : 0.5
              }}
            >
              Call me →
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted2)' }}>
            SRINI will call your number within 30 seconds. The call is completely free for you.
          </p>
        </>
      )}

      {status === 'calling' && (
        <p className="text-sm text-center py-4" style={{ color: 'var(--muted2)' }}>
          📞 Connecting SRINI to your number...
        </p>
      )}

      {status === 'scheduled' && (
        <div className="text-center py-4">
          <p className="text-sm mb-2" style={{ color: '#34d399' }}>
            ✓ SRINI is calling you now. Pick up!
          </p>
          <p className="text-xs" style={{ color: 'var(--muted2)' }}>
            You should receive a call within 30 seconds
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-4">
          <p className="text-sm mb-2" style={{ color: '#ef4444' }}>
            ⚠ {errorMsg}
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="text-xs"
            style={{ color: 'var(--muted2)' }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

// Helper functions
function buildDomainContext(domain, roadmap) {
  if (!roadmap) return `Domain: ${domain}`

  const phases = roadmap.phases?.map(p =>
    `Phase ${p.number}: ${p.title} (${p.duration})`
  ).join('\n') || ''

  return `DOMAIN: ${domain}\nROADMAP PHASES:\n${phases}`
}

function buildSalaryData(salaryData) {
  if (!salaryData) return 'Salary data not available'

  return `SALARY PROGRESSION:
Fresher: ${salaryData.fresher || 'N/A'}
Junior: ${salaryData.junior || 'N/A'}
Mid-level: ${salaryData.mid || 'N/A'}
Senior: ${salaryData.senior || 'N/A'}`
}
