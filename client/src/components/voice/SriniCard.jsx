import { useState, useEffect } from 'react'
import Vapi from '@vapi-ai/web'
import WebCallModal from './WebCallModal'
import PhoneCallOption from './PhoneCallOption'
import PostCallSummary from './PostCallSummary'
import { DOMAIN_ROADMAPS } from '../../data/roadmaps'
import { DOMAIN_COLORS } from '../../lib/constants'
import { supabase } from '../../lib/supabase'

const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY)

export default function SriniCard({ student, domain, profile, quizEmotion, sessionId }) {
  const [callState, setCallState] = useState('idle')
  // idle | requesting_mic | calling | active | ended | error
  const [showPhoneOption, setShowPhoneOption] = useState(false)
  const [callData, setCallData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const roadmap = DOMAIN_ROADMAPS[domain]
  const domainColor = DOMAIN_COLORS[domain] || 'var(--accent)'
  const domainContext = buildDomainContext(domain, roadmap)
  const salaryData = buildSalaryData(roadmap?.salary)

  useEffect(() => {
    // Vapi event listeners
    vapi.on('call-start', () => {
      setCallState('active')
      console.log('Call started')
    })

    vapi.on('call-end', (data) => {
      setCallState('ended')
      setCallData(data)
      console.log('Call ended:', data)
    })

    vapi.on('error', (error) => {
      setCallState('error')
      setErrorMessage(error.message || 'Call failed. Please try again.')
      console.error('Vapi error:', error)
    })

    return () => {
      vapi.removeAllListeners()
    }
  }, [])

  const startWebCall = async () => {
    try {
      setCallState('requesting_mic')
      setErrorMessage('')

      // Request microphone permission explicitly
      await navigator.mediaDevices.getUserMedia({ audio: true })

      setCallState('calling')

      const assistantOverrides = {
        variableValues: {
          student_name: student.name || 'there',
          domain: domain,
          profile_type: profile,
          time_available: student.timeAvailable || '6 months',
          priority: student.priority || 'balanced',
          quiz_emotion: quizEmotion || 'curiosity',
          year_of_study: student.year || '2nd year',
          domain_context: domainContext,
          salary_data: salaryData,
        },
      }

      const call = await vapi.start(
        import.meta.env.VITE_VAPI_ASSISTANT_ID,
        assistantOverrides
      )

      // Log session to backend
      if (call?.id) {
        logCallSession(call.id, student, domain, profile, sessionId)
      }

    } catch (err) {
      console.error('Call start error:', err)
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Please allow microphone access in your browser to talk to SRINI.')
      } else {
        setErrorMessage('Failed to start call. Please check your internet connection.')
      }
      setCallState('error')
    }
  }

  const endCall = () => {
    vapi.stop()
  }

  const logCallSession = async (vapiCallId, student, domain, profile, quizSessionId) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      await fetch(`${apiBase}/api/srini-log-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vapiCallId,
          studentName: student.name,
          studentEmail: student.email,
          domain,
          profileType: profile,
          quizSessionId
        })
      })
    } catch (err) {
      console.error('Failed to log session:', err)
    }
  }

  if (callState === 'active') {
    return <WebCallModal
      student={student}
      domain={domain}
      onEnd={endCall}
      vapi={vapi}
    />
  }

  if (callState === 'ended') {
    return <PostCallSummary
      student={student}
      callData={callData}
      domain={domain}
    />
  }

  return (
    <div className="card p-6 mb-8" style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border2)' }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">🎙</span>
        <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Talk to SRINI
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        Still have questions after your result? SRINI already knows your domain and profile.
        One tap. Real conversation. No scripts.
      </p>

      <button
        onClick={startWebCall}
        disabled={callState === 'requesting_mic' || callState === 'calling'}
        className="btn-primary w-full mb-3 flex items-center justify-center gap-2"
        style={{
          background: callState === 'error' ? '#ef4444' : domainColor,
          opacity: (callState === 'requesting_mic' || callState === 'calling') ? 0.6 : 1
        }}
      >
        {callState === 'requesting_mic' && '🎤 Allowing microphone...'}
        {callState === 'calling' && '📞 Connecting to SRINI...'}
        {callState === 'idle' && (
          <>
            <span>▶</span>
            <span>Talk Now — Browser Call</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
              FREE
            </span>
          </>
        )}
        {callState === 'error' && '⚠ Try again'}
      </button>

      {errorMessage && (
        <p className="text-xs mb-3 text-center" style={{ color: '#ef4444' }}>
          {errorMessage}
        </p>
      )}

      <button
        className="text-sm text-center w-full mb-3"
        style={{ color: 'var(--muted)', textDecoration: 'none' }}
        onClick={() => setShowPhoneOption(!showPhoneOption)}
        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
      >
        Or prefer a real phone call? →
      </button>

      {showPhoneOption && (
        <PhoneCallOption
          student={student}
          domain={domain}
          profile={profile}
          quizEmotion={quizEmotion}
          roadmap={roadmap}
        />
      )}

      <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
        {['EN', 'தமிழ்', 'हिंदी', 'తెలుగు', 'മലയ', 'ಕನ್ನಡ'].map(lang => (
          <span
            key={lang}
            className="text-xs px-2 py-1 rounded"
            style={{ background: 'var(--surface3)', color: 'var(--muted2)' }}
          >
            {lang}
          </span>
        ))}
      </div>
      <p className="text-xs text-center mt-2" style={{ color: 'var(--muted2)' }}>
        Switch languages anytime during the call
      </p>
    </div>
  )
}

// Helper functions
function buildDomainContext(domain, roadmap) {
  if (!roadmap) return `Domain: ${domain}`

  const phases = roadmap.phases?.map(p =>
    `Phase ${p.number}: ${p.title} (${p.duration})`
  ).join('\n') || ''

  const certs = roadmap.certifications?.map(c =>
    `- ${c.name} (${c.provider})`
  ).join('\n') || ''

  return `DOMAIN: ${domain}
TAGLINE: ${roadmap.tagline || ''}

ROADMAP PHASES:
${phases}

KEY CERTIFICATIONS:
${certs}

FRESHER REALITY:
Entry Salary: ${roadmap.fresherReality?.entrySalary || 'N/A'}
When You Start Earning: ${roadmap.fresherReality?.earningStart || 'N/A'}
First Job Title: ${roadmap.fresherReality?.firstJobTitle || 'N/A'}`
}

function buildSalaryData(salaryData) {
  if (!salaryData) return 'Salary data not available'

  return `SALARY PROGRESSION:
Fresher (0-1 year): ${salaryData.fresher || 'N/A'}
Junior (1-3 years): ${salaryData.junior || 'N/A'}
Mid-level (3-5 years): ${salaryData.mid || 'N/A'}
Senior (5+ years): ${salaryData.senior || 'N/A'}
Time to job-ready: ${salaryData.timeToJobReady || 'N/A'}`
}
