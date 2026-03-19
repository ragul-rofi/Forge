import { useState, useEffect, useRef } from 'react'
import { DOMAIN_COLORS } from '../../lib/constants'

export default function WebCallModal({ student, domain, onEnd, vapi }) {
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [volumeLevels, setVolumeLevels] = useState(Array(20).fill(0))
  const [speakingLabel, setSpeakingLabel] = useState('SRINI is speaking')
  const timerRef = useRef(null)
  const waveColor = DOMAIN_COLORS[domain] || 'var(--accent)'

  useEffect(() => {
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)

    vapi.on('volume-level', (volume) => {
      setVolumeLevels(prev => {
        const next = [...prev.slice(1), volume * 100]
        return next
      })
    })

    vapi.on('speech-start', () => setSpeakingLabel('SRINI is speaking'))
    vapi.on('speech-end', () => setSpeakingLabel('Listening...'))

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [vapi])

  const toggleMute = () => {
    vapi.setMuted(!isMuted)
    setIsMuted(!isMuted)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div className="max-w-md w-full mx-4 text-center p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)' }}>
        {/* Agent Info */}
        <div className="mb-8">
          <span className="text-6xl mb-4 block">🎙</span>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            SRINI
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Your FORGE Voice Guide
          </p>
        </div>

        {/* Waveform */}
        <div className="flex items-center justify-center gap-1 h-24 mb-6">
          {volumeLevels.map((vol, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-100"
              style={{
                height: `${Math.max(4, vol)}px`,
                background: waveColor,
                opacity: 0.7 + (vol / 300)
              }}
            />
          ))}
        </div>

        {/* Call Status */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#f43f5e' }}
          />
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            LIVE
          </span>
          <span className="text-sm" style={{ color: 'var(--muted2)', fontFamily: 'JetBrains Mono, monospace' }}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Speaking Label */}
        <p
          className="text-sm mb-8 h-6"
          style={{ color: 'var(--muted2)' }}
        >
          {speakingLabel}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={toggleMute}
            className="px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--surface2)',
              color: isMuted ? '#f43f5e' : 'var(--text)',
              border: '1px solid var(--border2)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface2)' }}
          >
            {isMuted ? '🔇 Muted' : '🎙 Mute'}
          </button>
          <button
            onClick={onEnd}
            className="px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'rgba(244,63,94,0.15)',
              color: '#f43f5e',
              border: '1px solid rgba(244,63,94,0.35)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)' }}
          >
            📵 End Call
          </button>
        </div>

        {/* Language Hint */}
        <p className="text-xs" style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          Switch languages anytime — just speak
        </p>
      </div>
    </div>
  )
}
