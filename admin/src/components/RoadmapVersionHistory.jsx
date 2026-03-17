import { Clock, User } from 'lucide-react'

export default function RoadmapVersionHistory({ changeLog = [], onRestore }) {
  if (!changeLog || changeLog.length === 0) {
    return (
      <div className="card p-5">
        <h4 className="section-label mb-3">Version History</h4>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>No changes recorded yet.</p>
      </div>
    )
  }

  // Show last 5 changes
  const recent = changeLog.slice(-5).reverse()

  return (
    <div className="card p-5">
      <h4 className="section-label mb-4">Version History</h4>
      <div className="space-y-3">
        {recent.map((entry, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <Clock size={12} />
                <span>{new Date(entry.timestamp).toLocaleString('en-IN')}</span>
              </div>
              {i > 0 && onRestore && (
                <button
                  onClick={() => onRestore(entry)}
                  className="text-xs px-2 py-0.5 rounded cursor-pointer"
                  style={{
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    background: 'none',
                  }}
                >
                  Restore
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <User size={12} />
              <span>{entry.admin_email || 'Unknown'}</span>
            </div>
            {entry.description && (
              <p className="text-xs mt-1" style={{ color: 'var(--muted2)' }}>
                {entry.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
