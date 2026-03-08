import { PROFILE_ICONS } from '../lib/constants'
import { Hammer, Brain, Shield, Palette, Crown, Handshake, Telescope } from 'lucide-react'

const PROFILES = ['maker', 'thinker', 'protector', 'creator', 'leader', 'helper', 'explorer']

const ICON_MAP = {
  Hammer, Brain, Shield, Palette, Crown, Handshake, Telescope,
}

const SCORE_LABELS = {
  '-2': 'Strong negative',
  '-1': 'Weak negative',
  '0': 'Neutral',
  '1': 'Weak positive',
  '2': 'Positive',
  '3': 'Strong positive',
}

function getScoreColor(val) {
  if (val >= 2) return '#10b981'
  if (val === 1) return '#34d399'
  if (val === 0) return 'var(--muted)'
  if (val === -1) return '#fb923c'
  return '#f43f5e'
}

export default function OptionScoreEditor({ scores, onChange }) {
  return (
    <div className="space-y-3">
      {PROFILES.map((profile) => {
        const val = scores[profile] || 0
        const iconName = PROFILE_ICONS[profile]
        const ProfileIcon = ICON_MAP[iconName]
        const color = getScoreColor(val)
        const pct = ((val + 2) / 5) * 100

        return (
          <div key={profile} className="flex items-center gap-3">
            {/* Icon + Name */}
            <div className="flex items-center gap-1.5 w-24 shrink-0">
              {ProfileIcon && <ProfileIcon size={14} style={{ color }} />}
              <span className="text-xs capitalize" style={{ color: 'var(--muted2)' }}>
                {profile}
              </span>
            </div>

            {/* Slider track */}
            <div className="flex-1 relative group">
              {/* Background track */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, #f43f5e, #fb923c, var(--border), #34d399, #10b981)`,
                    opacity: 0.6,
                  }}
                />
              </div>
              {/* Step dots */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-0">
                {[-2, -1, 0, 1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => onChange(profile, step)}
                    className="w-3 h-3 rounded-full border-2 transition-all duration-150 hover:scale-125 z-10"
                    style={{
                      borderColor: val === step ? color : 'var(--border)',
                      backgroundColor: val === step ? color : 'var(--bg)',
                    }}
                    title={`${step > 0 ? '+' : ''}${step}: ${SCORE_LABELS[String(step)]}`}
                  />
                ))}
              </div>
              {/* Hidden range for accessibility */}
              <input
                type="range"
                min={-2}
                max={3}
                value={val}
                onChange={(e) => onChange(profile, parseInt(e.target.value))}
                className="w-full opacity-0 absolute inset-0 cursor-pointer z-20"
                style={{ height: '24px' }}
              />
              <div className="h-6" />
            </div>

            {/* Score value */}
            <span
              className="font-mono text-xs w-7 text-center font-semibold"
              style={{ color }}
            >
              {val > 0 ? '+' : ''}{val}
            </span>
          </div>
        )
      })}
    </div>
  )
}
