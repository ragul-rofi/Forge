import { useState, useEffect } from 'react'
import { PROFILE_ICONS } from '../../lib/constants'
import { PROFILE_NAMES, PROFILE_DESCRIPTIONS } from '../../lib/profiles'
import { Hammer, Brain, Shield, Palette, Crown, Handshake, Telescope, Sparkles } from 'lucide-react'

const ICON_MAP = { Hammer, Brain, Shield, Palette, Crown, Handshake, Telescope, Sparkles }

export default function ProfileReveal({ profile }) {
  const [showProfile, setShowProfile] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [showDomain, setShowDomain] = useState(false)

  const description = PROFILE_DESCRIPTIONS[profile] || ''
  const iconName = PROFILE_ICONS[profile] || 'Sparkles'
  const ProfileIcon = ICON_MAP[iconName] || Sparkles
  const name = PROFILE_NAMES[profile] || profile?.toUpperCase()

  useEffect(() => {
    const timer = setTimeout(() => setShowProfile(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showProfile) return

    const words = description.split(' ')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedText(words.slice(0, i).join(' '))
      if (i >= words.length) {
        clearInterval(interval)
        setTimeout(() => setShowDomain(true), 1500)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [showProfile, description])

  if (!showProfile) return <div className="h-32" />

  return (
    <div className="fade-in text-center">
      <div className="flex justify-center mb-4">
        <ProfileIcon size={48} strokeWidth={1.5} style={{ color: 'var(--text)' }} />
      </div>
      <h2 className="text-sm font-semibold tracking-wide mb-6" style={{ color: 'var(--muted2)' }}>
        {name}
      </h2>
      <p className="text-lg md:text-xl leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text)' }}>
        {displayedText}
      </p>
      {showDomain && (
        <div className="mt-8 fade-in">
          <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
            People like you typically forge their path in:
          </p>
        </div>
      )}
    </div>
  )
}
