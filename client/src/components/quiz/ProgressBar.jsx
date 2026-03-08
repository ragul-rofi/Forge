export default function ProgressBar({ current, total, color = 'var(--text)' }) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--surface2)' }}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}
