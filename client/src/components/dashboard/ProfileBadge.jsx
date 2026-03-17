import { Flame } from 'lucide-react'
import ProgressRing from './ProgressRing'
import { DOMAIN_NAMES } from '../../lib/constants'

const PROFILE_EMOJI = {
  maker: '🔨',
  thinker: '🧠',
  protector: '🛡️',
  creator: '🎨',
  leader: '👑',
  helper: '🤝',
  explorer: '🧭',
}

export default function ProfileBadge({ student, domainColor, completedPhases, daysSinceStart }) {
  return (
    <section className="card p-5 mb-6" style={{ border: `1px solid ${domainColor}` }}>
      <div className="flex items-center gap-4">
        <ProgressRing progress={completedPhases} total={5} color={domainColor} size={96} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: domainColor }}>
            {PROFILE_EMOJI[student.profile_type] || '✨'} THE {(student.profile_type || 'MAKER').toUpperCase()}
          </p>
          <p className="text-sm" style={{ color: 'var(--text)' }}>{DOMAIN_NAMES[student.domain] || student.domain}</p>
          <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
            <span>{daysSinceStart} days active</span>
            <span className="inline-flex items-center gap-1"><Flame size={12} /> {student.streak_days || 0} days</span>
          </div>
        </div>
      </div>
    </section>
  )
}
