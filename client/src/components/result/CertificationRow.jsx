export default function CertificationRow({ certifications, domainColor }) {
  return (
    <div className="card p-4">
      <h4 className="section-label mb-4">Certifications</h4>
      <div className="space-y-3">
        {certifications.map((cert, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span style={{ color: domainColor }}>
                {Array.from({ length: cert.priority }, (_, i) => '★').join('')}
              </span>
              <a
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
                style={{ color: 'var(--text)' }}
              >
                {cert.name}
              </a>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              style={{ color: 'var(--muted)', flexShrink: 0 }}
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}
