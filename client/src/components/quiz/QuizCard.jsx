import { useState, useCallback } from 'react'
import OptionButton from './OptionButton'
import ProgressBar from './ProgressBar'
import SignalBadge from '../ui/SignalBadge'

export default function QuizCard({ question, current, total, onAnswer, domainColor }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

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

  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="slide-up w-full max-w-2xl mx-auto">
      {/* Progress */}
      <ProgressBar current={current} total={total} color={domainColor || 'var(--text)'} />

      <div className="card mt-6 p-6 md:p-8">
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[11px] tracking-wider" style={{ color: 'var(--muted)' }}>
            Q {current} / {total}
          </span>
          <SignalBadge signal={question.signal_type} />
        </div>

        {/* Question text */}
        <h2 className="font-serif text-xl md:text-2xl font-semibold leading-snug mb-8" style={{ color: 'var(--text)' }}>
          {question.question_text}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option, i) => (
            <OptionButton
              key={option.id}
              letter={letters[i]}
              text={option.text}
              selected={selectedOption === option.id}
              disabled={!!selectedOption}
              onClick={() => handleSelect(option)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
