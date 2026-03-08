import { SIGNAL_COLORS } from '../../lib/constants'

export default function SignalBadge({ signal }) {
  if (!signal) return null
  const color = SIGNAL_COLORS[signal] || '#888'

  return (
    <span
      className="tag"
      style={{
        backgroundColor: `${color}15`,
        color,
        borderColor: `${color}40`,
      }}
    >
      {signal.toUpperCase()}
    </span>
  )
}
