export default function ProgressRing({ completed = 0, total = 5, progress, color, size = 80 }) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const completedValue = typeof progress === 'number' ? progress : completed
  const ratio = total > 0 ? (completedValue / total) : 0
  const offset = circumference - ratio * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <span
        className="absolute text-sm font-bold"
        style={{ color: 'var(--text)' }}
      >
        {completedValue}/{total}
      </span>
    </div>
  )
}
