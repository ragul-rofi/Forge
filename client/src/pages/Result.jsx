import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../lib/constants'
import { DOMAIN_ROADMAPS } from '../data/roadmaps'
import ThemeToggle from '../components/ui/ThemeToggle'
import Logo from '../components/ui/Logo'
import ProfileReveal from '../components/result/ProfileReveal'
import DomainCard from '../components/result/DomainCard'
import SalaryCard from '../components/result/SalaryCard'
import RoadmapPhase from '../components/result/RoadmapPhase'
import CertificationRow from '../components/result/CertificationRow'
import LoadingDots from '../components/ui/LoadingDots'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function Result() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchSession() {
      // Check if this is a local session (offline mode)
      if (sessionId.startsWith('local-')) {
        const saved = localStorage.getItem('forge-quiz-state')
        if (saved) {
          const state = JSON.parse(saved)
          if (state.result) {
            setSession({
              student_name: state.studentInfo.name,
              student_email: state.studentInfo.email,
              primary_profile: state.result.primary,
              secondary_profile: state.result.secondary,
              recommended_domain: state.result.recommendedDomain,
              second_domain: state.result.secondDomain,
              score_breakdown: state.result.scores,
              validate_target: state.validateTarget,
              validate_verdict: state.result.validateVerdict,
              quiz_mode: state.mode,
              time_available: state.result.timeAvailable,
              priority: state.result.priority,
              overrideReason: state.result.overrideReason,
            })
            setLoading(false)

            // Try sending email
            sendResultEmail(state.studentInfo.name, state.studentInfo.email, state.result.recommendedDomain, sessionId)
            return
          }
        }
        setError('Session not found')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (fetchError) throw fetchError
        setSession(data)

        // Send result email if not already sent
        if (data && !data.email_sent) {
          sendResultEmail(data.student_name, data.student_email, data.recommended_domain, sessionId)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        // Try local state fallback
        const saved = localStorage.getItem('forge-quiz-state')
        if (saved) {
          const state = JSON.parse(saved)
          if (state.result) {
            setSession({
              student_name: state.studentInfo.name,
              student_email: state.studentInfo.email,
              primary_profile: state.result.primary,
              secondary_profile: state.result.secondary,
              recommended_domain: state.result.recommendedDomain,
              second_domain: state.result.secondDomain,
              score_breakdown: state.result.scores,
              validate_target: state.validateTarget,
              validate_verdict: state.result.validateVerdict,
              quiz_mode: state.mode,
              time_available: state.result.timeAvailable,
              priority: state.result.priority,
              overrideReason: state.result.overrideReason,
            })
          } else {
            setError('Session not found')
          }
        } else {
          setError('Session not found')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  async function sendResultEmail(name, email, domain, sid) {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      await fetch(`${apiBase}/api/send-result-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, domain, sessionId: sid }),
      })
    } catch (err) {
      console.error('Email send failed:', err)
    }
  }

  const handleShare = () => {
    const domain = DOMAIN_NAMES[session.recommended_domain] || session.recommended_domain
    const text = `I just took the FORGE career profiler quiz and my recommended domain is ${domain}! Take the quiz: ${window.location.origin}/quiz`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <LoadingDots />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)' }}>{error || 'Session not found'}</p>
        <Link to="/quiz" className="btn-primary no-underline inline-flex items-center gap-1">Take the Quiz <ArrowRight size={16} /></Link>
      </div>
    )
  }

  const domain = session.recommended_domain
  const domainColor = DOMAIN_COLORS[domain] || '#888'
  const roadmap = DOMAIN_ROADMAPS[domain]
  const secondDomain = session.second_domain
  const isValidate = session.quiz_mode === 'validate'
  const verdict = session.validate_verdict

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Link to="/" className="no-underline">
          <Logo height={28} />
        </Link>
        <ThemeToggle />
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-16 pt-8">
        {/* Section 1: Profile Reveal */}
        <section className="mb-12">
          <ProfileReveal profile={session.primary_profile} />
          <div className="mt-6">
            <DomainCard domain={domain} large />
          </div>

          {roadmap && (
            <p className="text-center text-sm mt-2 italic" style={{ color: 'var(--muted2)' }}>
              {roadmap.tagline}
            </p>
          )}
        </section>

        {/* Validate Verdict */}
        {isValidate && verdict && (
          <section className="mb-8">
            <div
              className="card p-5"
              style={{
                borderLeft: '4px solid',
                borderLeftColor: verdict === 'strong' ? '#10b981' : verdict === 'redirect' ? '#f43f5e' : '#fbbf24'
              }}
            >
              <h4 className="text-xs font-semibold tracking-wide mb-2" style={{
                color: verdict === 'strong' ? '#10b981' : verdict === 'redirect' ? '#f43f5e' : '#fbbf24'
              }}>
                {verdict === 'strong' ? 'Strong Fit' : verdict === 'redirect' ? 'Redirect Suggested' : 'Proceed with Caution'}
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                {verdict === 'strong'
                  ? `Your answers strongly align with ${DOMAIN_NAMES[domain]}. You have genuine interest, realistic expectations, and the commitment needed. Go for it.`
                  : verdict === 'redirect'
                    ? `Based on your answers, ${DOMAIN_NAMES[domain]} may not be the best fit right now. Your natural strengths point more toward ${DOMAIN_NAMES[secondDomain] || 'another domain'}.`
                    : `You show some alignment with ${DOMAIN_NAMES[domain]}, but there are areas to strengthen — awareness, commitment, or genuine interest. Explore it, but keep an open mind.`
                }
              </p>
            </div>
          </section>
        )}

        {/* Section 2: Gateway override note */}
        {session.overrideReason && (
          <section className="mb-8">
            <div className="card p-5" style={{ borderLeft: '4px solid #fbbf24' }}>
              <h4 className="text-xs font-semibold tracking-wide mb-2" style={{ color: '#fbbf24' }}>
                Timeline Adjustment
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted2)' }}>{session.overrideReason}</p>
            </div>
          </section>
        )}

        {/* Section 3: Salary Card */}
        {roadmap && (
          <section className="mb-8">
            <SalaryCard domain={domain} salaryData={roadmap.salary} />
          </section>
        )}

        {/* Section 4: Roadmap */}
        {roadmap && (
          <section className="mb-8">
            <h3 className="section-label mb-4">Your Roadmap</h3>
            {roadmap.phases.map((phase, i) => (
              <RoadmapPhase
                key={phase.number}
                phase={phase}
                defaultExpanded={i === 0}
                domainColor={domainColor}
              />
            ))}
          </section>
        )}

        {/* Certifications */}
        {roadmap && (
          <section className="mb-8">
            <CertificationRow certifications={roadmap.certifications} domainColor={domainColor} />
          </section>
        )}

        {/* Section 6: Secondary domain + Share */}
        <section className="space-y-4">
          {secondDomain && secondDomain !== domain && (
            <div className="card p-5">
              <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
                You also showed strong signals for:
              </p>
              <DomainCard domain={secondDomain} />
            </div>
          )}

          <button onClick={handleShare} className="btn-secondary w-full">
            {copied ? 'Copied to clipboard!' : 'Share My Result'}
          </button>

          <div className="text-center pt-4">
            <Link to="/quiz" className="text-sm no-underline inline-flex items-center gap-1" style={{ color: 'var(--muted)' }}>
              <ArrowLeft size={14} /> Take the quiz again
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="inline-flex items-center gap-2">
          <Logo height={14} />
          <span className="text-sm" style={{ color: 'var(--muted)' }}>· {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
