import { useState } from 'react'

export default function RoadmapPhase({ phase, defaultExpanded = false, domainColor }) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="card mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center justify-between cursor-pointer"
        style={{ background: 'none', border: 'none' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold w-6 h-6 flex items-center justify-center"
            style={{ backgroundColor: `${domainColor}20`, color: domainColor, borderRadius: '8px' }}
          >
            {phase.number}
          </span>
          <div>
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {phase.title}
            </h4>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {phase.duration}
            </span>
          </div>
        </div>
        <span style={{ color: 'var(--muted)' }}>{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 fade-in">
          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--muted2)' }}>
            {phase.description}
          </p>
          <ul className="space-y-2">
            {phase.tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text)' }}>
                <span style={{ color: domainColor }}>→</span>
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
