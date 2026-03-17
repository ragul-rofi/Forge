import { useMemo } from 'react'
import { Calendar } from 'lucide-react'

export default function StartTodayTimer({ timeToJobReady }) {
  const dates = useMemo(() => {
    if (!timeToJobReady) return null

    // Parse "4–6 months" pattern
    const match = timeToJobReady.match(/(\d+)[–-](\d+)\s*mo/)
    if (!match) return null

    const minMonths = parseInt(match[1])
    const maxMonths = parseInt(match[2])

    const now = new Date()

    const phase1End = new Date(now)
    phase1End.setDate(phase1End.getDate() + 21) // ~3 weeks for Phase 1

    const jobReadyMin = new Date(now)
    jobReadyMin.setMonth(jobReadyMin.getMonth() + minMonths)

    const jobReadyMax = new Date(now)
    jobReadyMax.setMonth(jobReadyMax.getMonth() + maxMonths)

    const fmt = (d) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

    return {
      phase1End: fmt(phase1End),
      jobReady: `${fmt(jobReadyMin)} – ${fmt(jobReadyMax)}`,
      minMonths,
    }
  }, [timeToJobReady])

  if (!dates) return null

  return (
    <div className="card p-5" style={{ borderLeft: '4px solid #10b981' }}>
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} style={{ color: '#10b981' }} />
        <h4 className="text-xs font-semibold tracking-wide" style={{ color: '#10b981' }}>
          START TODAY
        </h4>
      </div>
      <p className="text-sm" style={{ color: 'var(--muted2)' }}>
        Phase 1 takes ~3 weeks. If you start today, you finish it by{' '}
        <span className="font-semibold" style={{ color: 'var(--text)' }}>{dates.phase1End}</span>.
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
        Job-ready by{' '}
        <span className="font-semibold" style={{ color: 'var(--text)' }}>{dates.jobReady}</span>.
      </p>
    </div>
  )
}
