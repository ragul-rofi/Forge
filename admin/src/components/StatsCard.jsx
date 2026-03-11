export default function StatsCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="font-mono text-xs tracking-wider" style={{ color: 'var(--muted)' }}>
          {label}
        </p>
        {Icon && <Icon size={15} strokeWidth={1.5} style={{ color: 'var(--muted2)', flexShrink: 0 }} />}
      </div>
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
