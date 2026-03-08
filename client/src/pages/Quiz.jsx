import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import ThemeToggle from '../components/ui/ThemeToggle'
import PathSelector from '../components/quiz/PathSelector'
import GatewayQuestion from '../components/quiz/GatewayQuestion'
import QuizCard from '../components/quiz/QuizCard'
import LoadingDots from '../components/ui/LoadingDots'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../lib/constants'

export default function Quiz() {
  const navigate = useNavigate()
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

  // When quiz is done, save session and navigate to result
  useEffect(() => {
    if (state.phase === 'done' && state.result) {
      setSaving(true)
      saveSession().then(sessionId => {
        setSaving(false)
        if (sessionId) {
          navigate(`/result/${sessionId}`)
        }
      })
    }
  }, [state.phase, state.result])

  const handleSubmitInfo = (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.name.trim()) {
      setFormError('Please enter your name.')
      return
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address.')
      return
    }
    if (!formData.year) {
      setFormError('Please select your year of study.')
      return
    }

    submitStudentInfo(formData)
  }

  const domainColor = state.validateTarget ? DOMAIN_COLORS[state.validateTarget] : null

  // Render based on phase
  if (saving || (state.phase === 'done' && state.result)) {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <span
          className="text-xl font-[800] tracking-tighter cursor-pointer"
          style={{ color: 'var(--text)' }}
          onClick={() => {
            if (confirm('Leave the quiz? Your progress will be saved.')) {
              navigate('/')
            }
          }}
        >
          FORGE
        </span>
        <ThemeToggle />
      </nav>

      <div className="px-6 pb-16 pt-8 max-w-4xl mx-auto">
        {/* Step 0: Collect Info */}
        {state.phase === 'collect_info' && (
          <div className="fade-in w-full max-w-md mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Let's start with you.
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
              Just the basics — nothing else.
            </p>

            <form onSubmit={handleSubmitInfo} className="flex flex-col gap-4">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@email.com"
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
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Department (optional)</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. CSE, ECE, MBA..."
                />
              </div>

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <button type="submit" className="btn-primary mt-2">
                Continue →
              </button>

              <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
                Your email is used only to send your results. We don't spam.
              </p>
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
