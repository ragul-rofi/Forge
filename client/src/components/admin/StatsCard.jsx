export default function StatsCard({ label, value, sub, color }) {
  return (
    <div className="card p-5">
      <p className="font-mono text-xs tracking-wider mb-1" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p className="text-3xl font-[800] tracking-tight" style={{ color: color || 'var(--text)' }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: 'var(--muted2)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}
