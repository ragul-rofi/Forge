import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import { ArrowRight } from 'lucide-react'
import Logo from '../components/ui/Logo'
import PathSelector from '../components/quiz/PathSelector'
import GatewayQuestion from '../components/quiz/GatewayQuestion'
import QuizCard from '../components/quiz/QuizCard'
import LoadingDots from '../components/ui/LoadingDots'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../lib/constants'

export default function Quiz() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedMode = searchParams.get('mode') // 'general' | 'advanced' | 'validate'
  const {
    state,
    questions,
    currentGatewayQuestion,
    currentQuestion,
    totalQuestions,
    canGoBack,
    canGoForward,
    isReAnswering,
    previousAnswer,
    submitStudentInfo,
    submitEmail,
    proceedToGateway,
    selectMode,
    answerGateway,
    answerQuestion,
    goBack,
    goForward,
    saveSession,
    resetQuiz,
  } = useQuiz()

  const [formData, setFormData] = useState({
    name: state.studentInfo.name || '',
    email: state.studentInfo.email || '',
    year: state.studentInfo.year || '',
    department: state.studentInfo.department || '',
  })
  const [formError, setFormError] = useState('')
  const [selectedDomain, setSelectedDomain] = useState(state.validateTarget || '')
  const [saving, setSaving] = useState(false)
  const [emailGateValue, setEmailGateValue] = useState('')
  const [emailGateError, setEmailGateError] = useState('')
  const hasSaved = useRef(false)

  useEffect(() => {
    document.title = 'FORGE — Find Your Path'
  }, [])

  // When quiz is done, handle differently based on mode
  useEffect(() => {
    if (state.phase === 'done' && state.result) {
      // For general mode, wait for email gate
      if (state.mode === 'general' && !state.studentInfo.email) {
        return // Show email gate instead
      }
      // Prevent double-save (e.g. when email state change re-triggers this effect)
      if (hasSaved.current) return
      hasSaved.current = true
      // For advanced/validate, save immediately
      setSaving(true)
      saveSession().then(sessionId => {
        setSaving(false)
        if (sessionId) {
          navigate(`/result/${sessionId}`)
        }
      })
    }
  }, [state.phase, state.result, state.studentInfo.email])

  const handleEmailGateSubmit = (e) => {
    e.preventDefault()
    setEmailGateError('')
    const trimmed = emailGateValue.trim()
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailGateError('Please enter a valid email address.')
      return
    }
    // Prevent double-save if the useEffect has already fired
    if (hasSaved.current) return
    hasSaved.current = true
    if (trimmed) submitEmail(trimmed)
    setSaving(true)
    saveSession(trimmed || undefined).then(sessionId => {
      setSaving(false)
      if (sessionId) {
        navigate(`/result/${sessionId}`)
      }
    })
  }

  const handleSubmitInfo = (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.name.trim()) {
      setFormError('Please enter your name.')
      return
    }
    if (!formData.year) {
      setFormError('Please select your year of study.')
      return
    }

    submitStudentInfo(formData)
    // Auto-select mode from URL param after collect_info
    if (preselectedMode && ['general', 'advanced', 'validate'].includes(preselectedMode)) {
      selectMode(preselectedMode)
    }
  }

  const domainColor = state.validateTarget ? DOMAIN_COLORS[state.validateTarget] : null

  // Render based on phase
  if (saving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Calculating your result...
          </h2>
          <LoadingDots />
        </div>
      </div>
    )
  }

  // Email gate for general mode — quiz done but no email yet
  if (state.phase === 'done' && state.result && state.mode === 'general' && !state.studentInfo.email) {
    const handleSkip = () => {
      setSaving(true)
      saveSession().then(sessionId => {
        setSaving(false)
        if (sessionId) navigate(`/result/${sessionId}`)
      })
    }

    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          <Logo height={28} />
        </nav>
        <div className="px-6 pb-16 pt-8 max-w-md mx-auto fade-in">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)' }}
            >
              <ArrowRight size={24} style={{ color: 'var(--text)' }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Your result is ready.
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Add your email to get a copy of your roadmap sent to you — useful for when you want to come back to it.
            </p>
          </div>
          <form onSubmit={handleEmailGateSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Email Address *</label>
              <input
                type="email"
                value={emailGateValue}
                onChange={e => setEmailGateValue(e.target.value)}
                placeholder="you@email.com"
                autoFocus
                required
              />
            </div>
            {emailGateError && (
              <p className="text-sm text-red-400">{emailGateError}</p>
            )}
            <button type="submit" className="btn-primary mt-2">
              Send Me a Copy &amp; See Results <ArrowRight size={16} className="inline ml-1" />
            </button>
            
            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              No spam. Your email is only used to send your roadmap.
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <span
          className="cursor-pointer"
          onClick={() => {
            if (confirm('Leave the quiz? Your progress will be saved.')) {
              navigate('/')
            }
          }}
        >
          <Logo height={28} />
        </span>
       
      </nav>

      <div className="px-6 pb-16 pt-8 max-w-4xl mx-auto">
        {/* Step 0: Collect Info */}
        {state.phase === 'collect_info' && (
          <div className="fade-in w-full max-w-sm mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Let's start with you.
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
              Two quick fields. That's it.
            </p>

            <form onSubmit={handleSubmitInfo} className="flex flex-col gap-4">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>First Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Year of Study *</label>
                <select
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                  required
                >
                  <option value="">Select year...</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="Final">Final Year</option>
                  <option value="Graduate">Already Graduated</option>
                </select>
              </div>

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <button type="submit" className="btn-primary mt-2">
                Continue <ArrowRight size={16} className="inline ml-1" />
              </button>
            </form>
          </div>
        )}

        {/* Step 1: Select Path */}
        {state.phase === 'select_path' && (
          <PathSelector
            onSelect={selectMode}
            selectedDomain={selectedDomain}
            onDomainChange={setSelectedDomain}
          />
        )}

        {/* Step 1.5: Email collection for advanced/validate modes */}
        {state.phase === 'collect_email' && (
          <div className="fade-in w-full max-w-md mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              One more thing.
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
              This quiz mode gives detailed results — we'll email you a copy too.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault()
              setFormError('')
              if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setFormError('Please enter a valid email address.')
                return
              }
              submitEmail(formData.email)
              proceedToGateway()
            }} className="flex flex-col gap-4">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@email.com"
                  autoFocus
                  required
                />
              </div>

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <button type="submit" className="btn-primary mt-2">
                Start Quiz <ArrowRight size={16} className="inline ml-1" />
              </button>

              <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
                Your email is used only to send your results. No spam.
              </p>
            </form>
          </div>
        )}

        {/* Step 2: Gateway Questions */}
        {state.phase === 'gateway' && currentGatewayQuestion && (
          <GatewayQuestion
            key={currentGatewayQuestion.id}
            question={currentGatewayQuestion}
            onAnswer={answerGateway}
          />
        )}

        {/* Step 3: Quiz Questions */}
        {state.phase === 'quiz' && currentQuestion && (
          <QuizCard
            key={`${currentQuestion.id}-${state.currentQuestionIndex}`}
            question={{
              ...currentQuestion,
              question_text: currentQuestion.question_text.replace(
                '{SELECTED_DOMAIN}',
                DOMAIN_NAMES[state.validateTarget] || state.validateTarget || ''
              ),
            }}
            current={state.currentQuestionIndex + 1}
            total={totalQuestions}
            onAnswer={answerQuestion}
            domainColor={domainColor}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onGoBack={goBack}
            onGoForward={goForward}
            isReAnswering={isReAnswering}
            previousAnswer={previousAnswer}
          />
        )}
      </div>
    </div>
  )
}
