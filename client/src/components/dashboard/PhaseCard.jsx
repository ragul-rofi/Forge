import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import confetti from 'canvas-confetti'

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
  const [pulseComplete, setPulseComplete] = useState(false)
  const allChecked = phase.tasks.every((_, i) => checkedTasks.includes(i))

  useEffect(() => {
    if (allChecked && !isComplete) {
      setPulseComplete(true)
      const timer = setTimeout(() => setPulseComplete(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [allChecked, isComplete])

  const handleComplete = () => {
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.7 } })
    onCompletePhase(phaseNumber)
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
                    transform: checked ? 'scale(1)' : 'scale(1)',
                    animation: checked ? 'phase-check-pop 120ms ease' : 'none',
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
          <p className="text-xs mb-1 italic" style={{ color: 'var(--muted)' }}>
            Ready when: {phase.readyCheck}
          </p>
        )}
        {phase.quitWarning && (
          <p className="text-xs mb-3" style={{ color: '#f43f5e' }}>
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
              animation: pulseComplete ? 'phase-complete-pulse 900ms ease-in-out' : 'none',
            }}
          >
            Mark Phase Complete →
          </button>
        )}
      </div>
      <style>{`
        @keyframes phase-check-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes phase-complete-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  )
}
