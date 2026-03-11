import { useState, useCallback, useRef } from 'react'
import OptionButton from './OptionButton'
import ProgressBar from './ProgressBar'
import SignalBadge from '../ui/SignalBadge'

export default function QuizCard({ question, current, total, onAnswer, domainColor, canGoBack, canGoForward, onGoBack, onGoForward, isReAnswering, previousAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const touchStartRef = useRef(null)

  const handleSelect = useCallback((option) => {
    if (selectedOption || transitioning) return
    setSelectedOption(option.id)
    setTransitioning(true)

    setTimeout(() => {
      onAnswer(question.id, option.id, option.scores, option.tag)
      setSelectedOption(null)
      setTransitioning(false)
    }, 300)
  }, [selectedOption, transitioning, onAnswer, question.id])

  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    // Only trigger on horizontal swipes (dx > dy) with enough distance
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return

    if (dx < 0 && canGoForward) {
      // Swipe left → next question (only if already answered)
      onGoForward()
    } else if (dx > 0 && canGoBack) {
      // Swipe right → previous question
      onGoBack()
    }
  }, [canGoForward, canGoBack, onGoForward, onGoBack])

  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="slide-up w-full max-w-2xl mx-auto" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Progress */}
      <ProgressBar current={current} total={total} color={domainColor || 'var(--text)'} />

      <div className="card mt-6 p-6 md:p-8">
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Question {current} of {total}
          </span>
          <SignalBadge signal={question.signal_type} />
        </div>

        {/* Question text */}
        <h2 className="text-xl md:text-2xl font-semibold leading-snug mb-8" style={{ color: 'var(--text)' }}>
          {question.question_text}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {question.options.map((option, i) => (
            <OptionButton
              key={option.id}
              letter={letters[i]}
              text={option.text}
              selected={selectedOption === option.id}
              previouslySelected={previousAnswer === option.id}
              disabled={!!selectedOption}
              onClick={() => handleSelect(option)}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 transition-all duration-150 cursor-pointer"
            style={{
              color: canGoBack ? 'var(--text)' : 'var(--muted)',
              opacity: canGoBack ? 1 : 0.4,
              backgroundColor: canGoBack ? 'var(--surface2)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          {isReAnswering && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Select an option to change your answer
            </span>
          )}

          {canGoForward && (
            <button
              onClick={onGoForward}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 transition-all duration-150 cursor-pointer"
              style={{
                color: 'var(--text)',
                backgroundColor: 'var(--surface2)',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
              }}
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
