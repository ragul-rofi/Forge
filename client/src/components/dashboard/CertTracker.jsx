import { useState } from 'react'

const CERT_STATUSES = ['Not Started', 'In Progress', 'Done']
const STATUS_COLORS = {
  'Not Started': 'var(--muted)',
  'In Progress': '#fbbf24',
  'Done': '#10b981',
}

export default function CertTracker({ certifications, domainColor, certProgress = {}, onUpdateStatus }) {
  return (
    <div className="card p-5">
      <h4 className="section-label mb-4">Certifications</h4>
      <div className="space-y-3">
        {certifications.map((cert, i) => {
          const status = certProgress[cert.name] || 'Not Started'
          return (
            <div key={i} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                {cert.priority === 2 && (
                  <span className="text-xs mt-0.5" style={{ color: domainColor }}>★</span>
                )}
                <div className="min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--text)' }}>
                    {cert.name}
                  </p>
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs no-underline hover:underline"
                      style={{ color: 'var(--muted)' }}
                    >
                      Exam page →
                    </a>
                  )}
                </div>
              </div>
              <select
                value={status}
                onChange={(e) => onUpdateStatus(cert.name, e.target.value)}
                className="text-xs px-2 py-1 rounded-md shrink-0 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: STATUS_COLORS[status],
                  border: '1px solid var(--border)',
                }}
              >
                {CERT_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}
