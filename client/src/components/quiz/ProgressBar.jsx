export default function ProgressBar({ current, total, color = 'var(--text)' }) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="w-full h-[3px]" style={{ backgroundColor: 'var(--surface3)', borderRadius: 0 }}>
      <div
        className="h-full transition-all ease-out"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}
