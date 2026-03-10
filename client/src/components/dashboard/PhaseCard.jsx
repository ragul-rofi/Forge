import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

export default function PhaseCard({
  phase,
  phaseNumber,
  domainColor,
  isCurrentPhase,
  isComplete,
  checkedTasks = [],
  onToggleTask,
  onCompletePhase,
}) {
  const [showConfetti, setShowConfetti] = useState(false)
  const allChecked = phase.tasks.every((_, i) => checkedTasks.includes(i))

  const handleComplete = () => {
    setShowConfetti(true)
    onCompletePhase(phaseNumber)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const statusLabel = isComplete ? 'COMPLETED' : isCurrentPhase ? 'IN PROGRESS' : 'UPCOMING'
  const statusColor = isComplete ? '#10b981' : isCurrentPhase ? domainColor : 'var(--muted)'

  return (
    <div
      className="card mb-4 relative overflow-hidden"
      style={{
        opacity: !isCurrentPhase && !isComplete ? 0.7 : 1,
        borderLeft: isCurrentPhase ? `3px solid ${domainColor}` : undefined,
      }}
    >
      {showConfetti && <ConfettiBurst />}

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: isComplete ? '#10b98120' : `${domainColor}20`,
                color: isComplete ? '#10b981' : domainColor,
              }}
            >
              {isComplete ? <Check size={14} /> : phaseNumber}
            </span>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Phase {phaseNumber} · {phase.title}
              </h4>
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: statusColor }}>
                {statusLabel}
              </span>
            </div>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>{phase.duration}</span>
        </div>

        <div className="space-y-2 mb-4">
          {phase.tasks.map((task, i) => {
            const checked = checkedTasks.includes(i)
            return (
              <label
                key={i}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                  style={{
                    borderColor: checked ? domainColor : 'var(--border)',
                    backgroundColor: checked ? domainColor : 'transparent',
                    transform: checked ? 'scale(1.1)' : 'scale(1)',
                  }}
                  onClick={() => onToggleTask(phaseNumber, i)}
                >
                  {checked && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
                <span
                  className="text-sm transition-all"
                  style={{
                    color: checked ? 'var(--muted)' : 'var(--text)',
                    textDecoration: checked ? 'line-through' : 'none',
                  }}
                  onClick={() => onToggleTask(phaseNumber, i)}
                >
                  {task}
                </span>
              </label>
            )
          })}
        </div>

        {phase.readyCheck && (
          <p className="text-xs mb-1" style={{ color: '#10b981' }}>
            ✓ Ready when: {phase.readyCheck}
          </p>
        )}
        {phase.quitWarning && (
          <p className="text-xs mb-3" style={{ color: '#fbbf24' }}>
            ⚠ Quit warning: {phase.quitWarning}
          </p>
        )}

        {isCurrentPhase && allChecked && !isComplete && (
          <button
            onClick={handleComplete}
            className="w-full py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            style={{
              backgroundColor: domainColor,
              color: '#fff',
              border: 'none',
            }}
          >
            Mark Phase Complete
          </button>
        )}
      </div>
    </div>
  )
}

function ConfettiBurst() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ['#10b981', '#fbbf24', '#38bdf8', '#e879f9', '#f43f5e'][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 6,
    }))
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: '50%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall 2s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-200px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
