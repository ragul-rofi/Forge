import { DOMAIN_NAMES, DOMAIN_COLORS } from '../../lib/constants'

const FAST_MONEY_MAP = {
  business: ['data', 'cloud'],
  design: ['cloud', 'data'],
  networking: ['cloud'],
  ai: ['data'],
}

export default function FastMoneyAlt({ primaryDomain, secondaryDomain, salaryData }) {
  if (!salaryData) return null

  // Parse entry salary to check threshold
  const entryMatch = salaryData.entry?.match(/(\d+)/)
  const entryLow = entryMatch ? parseInt(entryMatch[1]) : 0

  // Parse timeline
  const timeMatch = salaryData.timeToJobReady?.match(/(\d+)/)
  const monthsToJob = timeMatch ? parseInt(timeMatch[1]) : 0

  // Only show if entry < 5 LPA or timeline > 8 months
  if (entryLow >= 5 && monthsToJob <= 8) return null

  const alternatives = FAST_MONEY_MAP[primaryDomain]
  if (!alternatives || alternatives.length === 0) return null

  const altDomain = alternatives[0]
  const altName = DOMAIN_NAMES[altDomain]
  const altColor = DOMAIN_COLORS[altDomain]

  return (
    <div className="card p-5" style={{ borderLeft: '4px solid #fbbf24' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">⚡</span>
        <h4 className="text-xs font-semibold tracking-wide" style={{ color: '#fbbf24' }}>
          FASTER INCOME PATH
        </h4>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>(if timeline matters)</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted2)' }}>
        Your profile also fits{' '}
        <span className="font-semibold" style={{ color: altColor }}>{altName}</span>.
        That domain gets you earning faster with a shorter ramp-up.
      </p>
      <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted2)' }}>
        You can pursue both — start with{' '}
        <span className="font-semibold" style={{ color: altColor }}>{altName}</span>{' '}
        for income, transition to{' '}
        <span className="font-semibold" style={{ color: DOMAIN_COLORS[primaryDomain] }}>
          {DOMAIN_NAMES[primaryDomain]}
        </span>{' '}
        within 18 months.
      </p>
    </div>
  )
}
