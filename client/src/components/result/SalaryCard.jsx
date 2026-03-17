import { getDomainColor, getDomainName } from '../../lib/domains'

const AI_RISK_COLORS = {
  LOW: '#10b981',
  MED: '#fbbf24',
  HIGH: '#f43f5e',
}

const INDIA_SIGNAL_ICONS = {
  'Hottest': '🔥',
  'Very High': '🔥',
  'High': '⬆',
  'Growing': '⬆',
  'Stable': '➡',
}

export default function SalaryCard({ domain, salaryData }) {
  const color = getDomainColor(domain)

  const difficultyDots = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className="inline-block w-2 h-2 rounded-full"
      style={{
        backgroundColor: i < salaryData.difficulty ? color : 'var(--border)',
      }}
    />
  ))

  return (
    <div className="card p-6">
      <h4 className="section-label mb-4">Salary & Reality</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Entry Level</p>
          <p className="text-lg font-[800]" style={{ color: 'var(--text)' }}>{salaryData.entry}</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>2–3 Years</p>
          <p className="text-lg font-[800]" style={{ color: 'var(--text)' }}>{salaryData.mid}</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Time to Job-Ready</p>
          <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{salaryData.timeToJobReady}</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Difficulty</p>
          <div className="flex gap-1 items-center mt-1">{difficultyDots}</div>
        </div>
        {salaryData.aiRisk && (
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>AI Displacement Risk</p>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${AI_RISK_COLORS[salaryData.aiRisk] || '#888'}15`,
                color: AI_RISK_COLORS[salaryData.aiRisk] || '#888',
              }}
            >
              {salaryData.aiRisk}
            </span>
          </div>
        )}
        {salaryData.indiaSignal && (
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>India Growth Signal</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {INDIA_SIGNAL_ICONS[salaryData.indiaSignal] || ''} {salaryData.indiaSignal}
            </p>
          </div>
        )}
      </div>

      {salaryData.fastTrack && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <span
            className="text-xs font-medium px-3 py-1"
            style={{ backgroundColor: `${color}15`, color, borderRadius: '999px' }}
          >
            Fast track eligible
          </span>
        </div>
      )}
    </div>
  )
}
