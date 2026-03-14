import { Sprout, Search, Target } from 'lucide-react'

const PATHS = [
  {
    mode: 'general',
    icon: Sprout,
    title: 'Start from scratch',
    description: 'No tech knowledge needed — 16 simple questions to find your fit.',
    detail: '16 questions · ~6 min',
  },
  {
    mode: 'advanced',
    icon: Search,
    title: 'Go deeper',
    description: '25 questions across 5 types. Precise results and a specific roadmap.',
    detail: '25 questions · ~12 min',
  },
  {
    mode: 'validate',
    icon: Target,
    title: 'Test my choice',
    description: 'Already have a domain? 8 honest questions to see if it really fits.',
    detail: '8 questions · ~4 min',
  },
]

const DOMAIN_OPTIONS = [
  { value: 'cloud', label: 'Cloud Computing' },
  { value: 'fullstack', label: 'Full Stack Dev' },
  { value: 'data', label: 'Data Analytics' },
  { value: 'ai', label: 'AI & ML' },
  { value: 'cyber', label: 'Cybersecurity' },
  { value: 'design', label: 'UI/UX Design' },
  { value: 'networking', label: 'Networking' },
  { value: 'business', label: 'Business & PM' },
  { value: 'devops', label: 'DevOps & SRE' },
  { value: 'blockchain', label: 'Blockchain & Web3' },
  { value: 'iot', label: 'IoT & Embedded' },
  { value: 'genai', label: 'GenAI & AI Engineering' },
  { value: 'devrel', label: 'DevRel & Content' },
]

export default function PathSelector({ onSelect, selectedDomain, onDomainChange }) {
  return (
    <div className="fade-in w-full max-w-xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
          How do you want to start?
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Pick what feels right. There's no wrong choice.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {PATHS.map(path => (
          <div key={path.mode} className="card cursor-pointer group" onClick={() => {
            if (path.mode === 'validate' && !selectedDomain) return
            onSelect(path.mode, path.mode === 'validate' ? selectedDomain : null)
          }}>
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-0.5"><path.icon size={24} strokeWidth={1.5} style={{ color: 'var(--text)' }} /></span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
                  {path.title}
                </h3>
                <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
                  {path.description}
                </p>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {path.detail}
                </span>
              </div>
            </div>

            {path.mode === 'validate' && (
              <div className="mt-4 ml-10" onClick={e => e.stopPropagation()}>
                <select
                  className="w-full"
                  value={selectedDomain || ''}
                  onChange={e => onDomainChange(e.target.value)}
                >
                  <option value="">Pick a domain...</option>
                  {DOMAIN_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              className="btn-primary text-sm w-full mt-4"
              disabled={path.mode === 'validate' && !selectedDomain}
              onClick={(e) => {
                e.stopPropagation()
                if (path.mode === 'validate' && !selectedDomain) return
                onSelect(path.mode, path.mode === 'validate' ? selectedDomain : null)
              }}
            >
              {path.mode === 'validate' ? 'Validate' : 'Start'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
