import { useState } from 'react'
import DragTaskList from './DragTaskList'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

const MIN_PHASES = 3

export default function RoadmapEditor({ domain, template, domainColor, onChange }) {
  const [expandedPhase, setExpandedPhase] = useState(0)

  if (!template) return null

  const updateField = (field, value) => {
    onChange({ ...template, [field]: value })
  }

  const updateSalary = (field, value) => {
    onChange({
      ...template,
      salary_data: { ...template.salary_data, [field]: value },
    })
  }

  const addPhase = () => {
    const phases = [...(template.phases || [])]
    const nextNum = phases.length + 1
    phases.push({
      number: nextNum,
      title: `Phase ${nextNum}`,
      duration: '3–4 weeks',
      tasks: [''],
      readyCheck: '',
      quitWarning: '',
    })
    onChange({ ...template, phases })
  }

  const removePhase = (index) => {
    if ((template.phases || []).length <= MIN_PHASES) return
    const phases = template.phases.filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, number: i + 1 }))
    onChange({ ...template, phases })
    if (expandedPhase >= phases.length) setExpandedPhase(phases.length - 1)
  }

  const updatePhase = (index, field, value) => {
    const phases = [...template.phases]
    phases[index] = { ...phases[index], [field]: value }
    onChange({ ...template, phases })
  }

  const updatePhaseTasks = (index, tasks) => {
    const phases = [...template.phases]
    phases[index] = { ...phases[index], tasks }
    onChange({ ...template, phases })
  }

  const updateCert = (index, field, value) => {
    const certs = [...template.certifications]
    certs[index] = { ...certs[index], [field]: value }
    onChange({ ...template, certifications: certs })
  }

  const removeCert = (index) => {
    onChange({
      ...template,
      certifications: template.certifications.filter((_, i) => i !== index),
    })
  }

  const addCert = () => {
    onChange({
      ...template,
      certifications: [
        ...template.certifications,
        { name: '', priority: 1, link: '' },
      ],
    })
  }

  return (
    <div className="space-y-6">
      {/* Domain Header */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: domainColor }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            {template.domain_name || domain}
          </h3>
        </div>

        {/* Salary Fields */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: 'entry', label: 'Entry Salary' },
            { key: 'mid', label: '2-3yr Salary' },
            { key: 'timeToJobReady', label: 'Time to Job-Ready' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs" style={{ color: 'var(--muted)' }}>{label}</label>
              <input
                type="text"
                value={template.salary_data?.[key] || ''}
                onChange={(e) => updateSalary(key, e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Phase Editors */}
      {template.phases?.map((phase, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            onClick={() => setExpandedPhase(expandedPhase === i ? -1 : i)}
            className="w-full text-left p-4 flex items-center justify-between cursor-pointer"
            style={{ background: 'none', border: 'none' }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: `${domainColor}20`, color: domainColor }}
              >
                {phase.number || i + 1}
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Phase {phase.number || i + 1} — {phase.title}
              </span>
            </div>
            {expandedPhase === i ? (
              <ChevronUp size={16} style={{ color: 'var(--muted)' }} />
            ) : (
              <ChevronDown size={16} style={{ color: 'var(--muted)' }} />
            )}
          </button>

          {expandedPhase === i && (
            <div className="px-4 pb-4 space-y-3 fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs" style={{ color: 'var(--muted)' }}>Title</label>
                  <input
                    type="text"
                    value={phase.title}
                    onChange={(e) => updatePhase(i, 'title', e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-md text-sm"
                    style={{
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs" style={{ color: 'var(--muted)' }}>Duration</label>
                  <input
                    type="text"
                    value={phase.duration}
                    onChange={(e) => updatePhase(i, 'duration', e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-md text-sm"
                    style={{
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs" style={{ color: 'var(--muted)' }}>Tasks</label>
                <div className="mt-1">
                  <DragTaskList
                    tasks={phase.tasks || []}
                    onChange={(tasks) => updatePhaseTasks(i, tasks)}
                    domainColor={domainColor}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs" style={{ color: 'var(--muted)' }}>Ready Check</label>
                <textarea
                  value={phase.readyCheck || ''}
                  onChange={(e) => updatePhase(i, 'readyCheck', e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-1.5 rounded-md text-sm resize-none"
                  style={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label className="text-xs" style={{ color: 'var(--muted)' }}>Quit Warning</label>
                <textarea
                  value={phase.quitWarning || ''}
                  onChange={(e) => updatePhase(i, 'quitWarning', e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-1.5 rounded-md text-sm resize-none"
                  style={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Remove Phase button */}
              {(template.phases || []).length > MIN_PHASES && (
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => removePhase(i)}
                    className="text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-md cursor-pointer transition-colors hover:bg-white/5"
                    style={{ color: '#f43f5e', background: 'none', border: 'none' }}
                  >
                    <Trash2 size={12} /> Remove Phase
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add Phase button */}
      <button
        onClick={addPhase}
        className="w-full py-3 rounded-lg text-sm font-medium cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors hover:bg-white/5"
        style={{
          color: domainColor,
          border: `1px dashed ${domainColor}50`,
          background: 'none',
        }}
      >
        <Plus size={15} /> Add Phase
      </button>

      {/* Certifications Editor */}
      <div className="card p-5">
        <h4 className="section-label mb-4">Certifications</h4>
        <div className="space-y-3">
          {template.certifications?.map((cert, i) => (
            <div key={i} className="flex items-start gap-2">
              <button
                onClick={() => updateCert(i, 'priority', cert.priority === 2 ? 1 : 2)}
                className="mt-1 cursor-pointer shrink-0"
                style={{ background: 'none', border: 'none', color: cert.priority === 2 ? domainColor : 'var(--muted)' }}
                title={cert.priority === 2 ? 'Priority' : 'Normal'}
              >
                ★
              </button>
              <input
                type="text"
                value={cert.name}
                onChange={(e) => updateCert(i, 'name', e.target.value)}
                placeholder="Certification name"
                className="flex-1 px-3 py-1.5 rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                value={cert.link || ''}
                onChange={(e) => updateCert(i, 'link', e.target.value)}
                placeholder="Link"
                className="w-32 px-3 py-1.5 rounded-md text-sm hidden sm:block"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => removeCert(i)}
                className="p-1 cursor-pointer"
                style={{ color: '#f43f5e', background: 'none', border: 'none' }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addCert}
            className="text-xs px-3 py-1.5 rounded-md cursor-pointer"
            style={{
              color: domainColor,
              border: `1px dashed ${domainColor}`,
              background: 'none',
            }}
          >
            + Add Certification
          </button>
        </div>
      </div>
    </div>
  )
}
