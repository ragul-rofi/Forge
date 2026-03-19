import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, signInStudent, signUpStudent } from '../lib/supabase'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../lib/constants'
import { DOMAIN_ROADMAPS } from '../data/roadmaps'
import Logo from '../components/ui/Logo'
import ProfileReveal from '../components/result/ProfileReveal'
import DomainCard from '../components/result/DomainCard'
import SalaryCard from '../components/result/SalaryCard'
import RoadmapPhase from '../components/result/RoadmapPhase'
import CertificationRow from '../components/result/CertificationRow'
import FastMoneyAlt from '../components/result/FastMoneyAlt'
import IncomeTimeline from '../components/result/IncomeTimeline'
import NotMyVibeButton from '../components/result/NotMyVibeButton'
import StartTodayTimer from '../components/result/StartTodayTimer'
import SriniCard from '../components/voice/SriniCard'
import LoadingDots from '../components/ui/LoadingDots'
import { ArrowRight, ArrowLeft, Bookmark } from 'lucide-react'

export default function Result() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [existingStudent, setExistingStudent] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    document.title = 'FORGE — Your Result'
  }, [])

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
        if (data?.student_email) {
          setEmail(data.student_email)
          checkStudentExists(data.student_email)
        }

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
            const localSession = {
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
            }
            setSession(localSession)
            setEmail(localSession.student_email || '')
            if (localSession.student_email) checkStudentExists(localSession.student_email)
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

  async function checkStudentExists(studentEmail) {
    if (!studentEmail) return
    const { data } = await supabase
      .from('students')
      .select('id')
      .eq('email', studentEmail)
      .maybeSingle()
    setExistingStudent(!!data?.id)
  }

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

  async function persistStudentRecord(authUserId, normalizedEmail = email) {
    const domain = session.recommended_domain
    const roadmap = DOMAIN_ROADMAPS[domain]
    const { error: upsertError } = await supabase.from('students').upsert({
      id: authUserId,
      email: normalizedEmail,
      name: session.student_name || 'Student',
      domain,
      profile_type: session.primary_profile,
      quiz_session_id: sessionId,
      roadmap_data: roadmap,
      phase_progress: { phase_1: 'not_started' },
      last_active_date: new Date().toISOString().slice(0, 10),
    }, { onConflict: 'id' })

    if (upsertError) throw upsertError
  }

  const friendlyAuthError = (err) => {
    const message = (err?.message || '').toLowerCase()
    if (message.includes('invalid login credentials')) return 'Incorrect email or password.'
    if (message.includes('email not confirmed')) return 'Please verify your email first, then sign in.'
    if (message.includes('user already registered')) return 'Account already exists. Please sign in.'
    if (err?.status === 400) return 'Unable to continue. Please check your details and try again.'
    return err?.message || 'Unable to save roadmap. Please try again.'
  }

  async function handleSaveRoadmap(e) {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()

      if (!normalizedEmail || !password) {
        setAuthError('Please enter email and password.')
        return
      }

      if (existingStudent) {
        const { data, error: signInError } = await signInStudent(normalizedEmail, password)
        if (signInError) throw signInError
        if (data?.user?.id) {
          await persistStudentRecord(data.user.id, normalizedEmail)
          navigate('/dashboard')
        }
        return
      }

      const { data, error: signUpError } = await signUpStudent(normalizedEmail, password)
      if (signUpError) throw signUpError

      const alreadyRegistered =
        data?.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0

      if (alreadyRegistered) {
        setExistingStudent(true)
        setAuthError('Account already exists. Please sign in with your password.')
        return
      }

      if (data?.session?.user?.id) {
        await persistStudentRecord(data.session.user.id, normalizedEmail)
        navigate('/dashboard')
        return
      }

      const { data: signInData, error: postSignInError } = await signInStudent(normalizedEmail, password)
      if (postSignInError) throw postSignInError
      if (signInData?.user?.id) {
        await persistStudentRecord(signInData.user.id, normalizedEmail)
      }
      navigate('/dashboard')
    } catch (err) {
      setAuthError(friendlyAuthError(err))
    } finally {
      setAuthLoading(false)
    }
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

        {/* Fresher Reality Check */}
        {roadmap?.fresherReality && (
          <section className="mb-8">
            <div className="card p-5" style={{ borderLeft: `4px solid ${domainColor}` }}>
              <h4 className="text-xs font-semibold tracking-wide mb-3" style={{ color: domainColor }}>
                FRESHER REALITY CHECK
              </h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--muted2)' }}>
                <p><span style={{ color: 'var(--muted)' }}>Entry salary:</span> {roadmap.fresherReality.entrySalary}</p>
                <p><span style={{ color: 'var(--muted)' }}>When you start earning:</span> {roadmap.fresherReality.earningStart}</p>
                <p><span style={{ color: 'var(--muted)' }}>First job title:</span> {roadmap.fresherReality.firstJobTitle}</p>
                <p className="pt-1 italic text-xs" style={{ color: 'var(--muted)' }}>{roadmap.fresherReality.tip}</p>
              </div>
            </div>
          </section>
        )}

        {/* Prerequisite / Important Note */}
        {(roadmap?.prerequisiteNote || roadmap?.importantNote) && (
          <section className="mb-8">
            <div className="card p-5" style={{ borderLeft: '4px solid #fbbf24' }}>
              <h4 className="text-xs font-semibold tracking-wide mb-2" style={{ color: '#fbbf24' }}>
                IMPORTANT NOTE
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                {roadmap.prerequisiteNote || roadmap.importantNote}
              </p>
            </div>
          </section>
        )}

        {/* Fast Money Alternative */}
        {roadmap && (
          <section className="mb-8">
            <FastMoneyAlt
              primaryDomain={domain}
              secondaryDomain={secondDomain}
              salaryData={roadmap.salary}
            />
          </section>
        )}

        {/* Income Timeline */}
        {roadmap && (
          <section className="mb-8">
            <IncomeTimeline primaryDomain={domain} secondaryDomain={secondDomain} />
          </section>
        )}

        {/* Start Today Timer */}
        {roadmap && (
          <section className="mb-8">
            <StartTodayTimer timeToJobReady={roadmap.salary.timeToJobReady} />
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

        <section className="mb-8">
          <div className="card p-6" style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Bookmark size={18} style={{ color: domainColor }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Your roadmap disappears when you close this tab.</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Save it in 30 seconds. Track your progress. Talk to Srini anytime.
            </p>

            {existingStudent ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 text-sm font-semibold"
                style={{ backgroundColor: domainColor, color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius-sm)' }}
              >
                Continue in Dashboard →
              </button>
            ) : (
              <form onSubmit={handleSaveRoadmap} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  required
                  minLength={6}
                />
                {authError && <p className="text-xs" style={{ color: '#f43f5e' }}>{authError}</p>}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 text-sm font-semibold"
                  style={{ backgroundColor: domainColor, color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius-sm)', opacity: authLoading ? 0.7 : 1 }}
                >
                  {authLoading ? 'Saving...' : 'Save My Roadmap →'}
                </button>
                <Link to="/login" className="block text-xs text-center no-underline" style={{ color: 'var(--muted)' }}>
                  Already have an account? Sign in →
                </Link>
              </form>
            )}
          </div>
        </section>

        <section className="mb-8">
          <SriniCard
            student={{ name: session.student_name, email: session.student_email, year: session.year_of_study, timeAvailable: session.time_available, priority: session.priority }}
            domain={domain}
            profile={session.primary_profile}
            sessionId={sessionId}
          />
        </section>

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

          {/* Not My Vibe */}
          <div className="text-center">
            <NotMyVibeButton domain={domain} secondDomain={secondDomain} sessionId={sessionId} />
          </div>

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

      {/* Sticky bottom bar — save roadmap reminder */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-4 py-3"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <p className="text-xs sm:text-sm" style={{ color: 'var(--muted)' }}>
            Your roadmap disappears when you close this tab. Save it in 30 seconds.
          </p>
          <a
            href={`/login-student?signup=true&session=${sessionId}&domain=${domain}&profile=${session.primary_profile}`}
            className="btn-primary text-xs sm:text-sm no-underline whitespace-nowrap inline-flex items-center gap-1"
          >
            Save <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Spacer for sticky bar */}
      <div className="h-16" />
    </div>
  )
}
