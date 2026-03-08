import Badge from '../ui/Badge'

const PATHS = [
  {
    mode: 'general',
    badge: 'I HAVE NO IDEA',
    title: 'Start from scratch',
    description: '12 plain questions. No tech knowledge needed. We figure out who you are, then match you to a domain.',
    tags: ['12 QUESTIONS', '~5 MIN', 'ZERO JARGON'],
  },
  {
    mode: 'advanced',
    badge: 'I HAVE A ROUGH IDEA',
    title: 'Go deeper',
    description: '25 questions across 5 types. Cuts through noise. Gives a precise result and a specific roadmap.',
    tags: ['25 QUESTIONS', '~12 MIN', 'PRECISE RESULT'],
  },
  {
    mode: 'validate',
    badge: 'I ALREADY HAVE A DOMAIN',
    title: 'Test my choice',
    description: 'Tell us your domain. We ask 8 hard questions. We tell you honestly if it fits — or if something else does.',
    tags: ['8 QUESTIONS', '~4 MIN', 'HONEST VERDICT'],
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
]

export default function PathSelector({ onSelect, selectedDomain, onDomainChange }) {
  return (
    <div className="fade-in w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
          How do you want to start?
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Pick honestly. There's no wrong choice.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {PATHS.map(path => (
          <div key={path.mode} className="card cursor-pointer group" onClick={() => {
            if (path.mode === 'validate' && !selectedDomain) return
            onSelect(path.mode, path.mode === 'validate' ? selectedDomain : null)
          }}>
            <Badge className="mb-3">{path.badge}</Badge>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
              {path.title}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              {path.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {path.tags.map(tag => (
                <span
                  key={tag}
                  className="font-mono text-[9px] tracking-[0.1em] px-2 py-1 border"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted2)', borderRadius: '2px' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {path.mode === 'validate' && (
              <div className="mt-2 mb-4" onClick={e => e.stopPropagation()}>
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>
                  Which domain do you have in mind?
                </label>
                <select
                  className="w-full"
                  value={selectedDomain || ''}
                  onChange={e => onDomainChange(e.target.value)}
                >
                  <option value="">Select a domain...</option>
                  {DOMAIN_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              className="btn-primary text-sm w-full"
              disabled={path.mode === 'validate' && !selectedDomain}
              onClick={(e) => {
                e.stopPropagation()
                if (path.mode === 'validate' && !selectedDomain) return
                onSelect(path.mode, path.mode === 'validate' ? selectedDomain : null)
              }}
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
