import { ArrowRight } from 'lucide-react'

export default function NextStepCTA({ nextStep, domainColor }) {
  return (
    <div
      className="card p-6 md:p-8 border-2 text-center"
      style={{ borderColor: domainColor }}
    >
      <h3 className="section-label mb-3">YOUR MOVE THIS WEEK</h3>
      <p className="text-base md:text-lg font-medium mb-6 leading-relaxed" style={{ color: 'var(--text)' }}>
        {nextStep.text}
      </p>
      <a
        href={nextStep.link}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-1 no-underline text-base px-8 py-3"
      >
        Start This Now <ArrowRight size={18} />
      </a>
    </div>
  )
}
