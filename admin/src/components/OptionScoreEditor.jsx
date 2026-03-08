const PROFILES = ['maker', 'thinker', 'protector', 'creator', 'leader', 'helper', 'explorer']

export default function OptionScoreEditor({ scores, onChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {PROFILES.map((profile) => (
        <div key={profile} className="flex items-center gap-2">
          <label className="text-xs capitalize w-16 text-right" style={{ color: 'var(--muted2)' }}>
            {profile}
          </label>
          <input
            type="range"
            min={-2}
            max={3}
            value={scores[profile] || 0}
            onChange={(e) => onChange(profile, parseInt(e.target.value))}
            className="flex-1 h-1.5 accent-[var(--accent)]"
          />
          <span
            className="font-mono text-xs w-5 text-center"
            style={{
              color:
                (scores[profile] || 0) > 0
                  ? '#10b981'
                  : (scores[profile] || 0) < 0
                    ? '#f43f5e'
                    : 'var(--muted)',
            }}
          >
            {scores[profile] > 0 ? '+' : ''}{scores[profile] || 0}
          </span>
        </div>
      ))}
    </div>
  )
}
