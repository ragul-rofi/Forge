import PhaseCard from './PhaseCard'

export default function RoadmapView({ roadmap, domainColor, student, currentPhase, isPhaseComplete, toggleTask, completePhase }) {
  const completed = [1, 2, 3, 4, 5].filter((phase) => isPhaseComplete(phase)).length
  const percent = Math.round((completed / 5) * 100)

  return (
    <section className="mb-8">
      <div className="mb-3">
        <p className="text-xs mb-2" style={{ color: 'var(--muted2)', fontFamily: 'JetBrains Mono, monospace' }}>OVERALL PROGRESS {percent}%</p>
        <div style={{ height: 3, backgroundColor: 'var(--surface3)' }}>
          <div style={{ width: `${percent}%`, height: '100%', backgroundColor: domainColor, transition: 'width 300ms ease' }} />
        </div>
      </div>
      {roadmap?.phases?.map((phase) => (
        <PhaseCard
          key={phase.number}
          phase={phase}
          phaseNumber={phase.number}
          domainColor={domainColor}
          isCurrentPhase={phase.number === currentPhase}
          isComplete={isPhaseComplete(phase.number)}
          checkedTasks={student.phase_progress?.[`phase_${phase.number}`] || []}
          onToggleTask={toggleTask}
          onCompletePhase={completePhase}
        />
      ))}
    </section>
  )
}
