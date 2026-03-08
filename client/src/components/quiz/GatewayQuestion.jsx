import { useState, useCallback } from 'react'
import OptionButton from './OptionButton'
import Badge from '../ui/Badge'

export default function GatewayQuestion({ question, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleSelect = useCallback((option) => {
    if (selectedOption) return
    setSelectedOption(option.id)

    setTimeout(() => {
      onAnswer({ tag: option.tag, label: option.label })
      setSelectedOption(null)
    }, 300)
  }, [selectedOption, onAnswer])

  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="slide-up w-full max-w-2xl mx-auto">
      <div className="card p-6 md:p-8">
        <h2 className="font-serif text-xl md:text-2xl font-semibold leading-snug mb-8" style={{ color: 'var(--text)' }}>
          {question.question_text}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => (
            <div key={option.id}>
              <button
                onClick={() => handleSelect(option)}
                disabled={!!selectedOption}
                className="w-full text-left p-4 border transition-all duration-120 cursor-pointer"
                style={{
                  backgroundColor: selectedOption === option.id
                    ? 'var(--surface3)'
                    : 'var(--surface)',
                  borderColor: selectedOption === option.id ? 'var(--text)' : 'var(--border)',
                  borderRadius: '2px',
                  opacity: selectedOption && selectedOption !== option.id ? 0.5 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs mt-0.5 shrink-0" style={{ color: 'var(--muted)' }}>
                    {letters[i].toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm leading-relaxed block" style={{ color: 'var(--text)' }}>
                      {option.text}
                    </span>
                    {option.label && (
                      <span className="inline-block mt-2">
                        <Badge>{option.label}</Badge>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
