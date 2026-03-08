export default function ProgressBar({ current, total, color = 'var(--text)' }) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="w-full h-[2px] rounded-full" style={{ backgroundColor: 'var(--border)' }}>
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}
