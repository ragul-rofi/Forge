import { SIGNAL_COLORS } from '../../lib/constants'

export default function SignalBadge({ signal }) {
  if (!signal) return null
  const color = SIGNAL_COLORS[signal] || '#888'

  return (
    <span
      className="text-xs px-2.5 py-1 font-medium"
      style={{
        backgroundColor: `${color}15`,
        color,
        borderRadius: '999px',
      }}
    >
      {signal}
    </span>
  )
}
