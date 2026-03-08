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
            <div key={option.id} className="relative">
              <OptionButton
                letter={letters[i]}
                text={option.text}
                selected={selectedOption === option.id}
                disabled={!!selectedOption}
                onClick={() => handleSelect(option)}
              />
              {option.label && (
                <span className="absolute top-2 right-2">
                  <Badge>{option.label}</Badge>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
