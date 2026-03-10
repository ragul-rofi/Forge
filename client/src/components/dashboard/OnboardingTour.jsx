import { useState, useEffect } from 'react'

const STEPS = [
  {
    target: 'roadmap-section',
    title: 'Your Roadmap',
    description: 'This is your roadmap — it lives here permanently. No more disappearing after you close the tab.',
  },
  {
    target: 'phase-card',
    title: 'Track Progress',
    description: 'Check off tasks as you complete them. Your progress is saved automatically.',
  },
  {
    target: 'ai-section',
    title: 'AI Guide',
    description: 'Ask the AI to customize your plan — skip things you know, adjust timelines, get unstuck.',
  },
  {
    target: 'cert-section',
    title: 'Certifications',
    description: 'Your certifications tracker lives here. Mark your progress as you go.',
  },
]

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      setVisible(false)
      onComplete()
    }
  }

  const handleSkip = () => {
    setVisible(false)
    onComplete()
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div
        className="card p-6 max-w-sm mx-4"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-xs cursor-pointer"
            style={{ color: 'var(--muted)', background: 'none', border: 'none' }}
          >
            Skip tour
          </button>
        </div>
        <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
          {current.title}
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted2)' }}>
          {current.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: i <= step ? 'var(--accent)' : 'var(--border)' }}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none' }}
          >
            {step < STEPS.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  )
}
