import { useState, useMemo } from 'react'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../lib/constants'
import { PROFILE_NAMES } from '../lib/profiles'
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react'
import Badge from './ui/Badge'
import DomainDot from './ui/DomainDot'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export default function StudentTable({ sessions = [], onExport, onDelete }) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [sort, setSort] = useState({ key: 'created_at', dir: 'desc' })
  const [selected, setSelected] = useState(new Set())
  const [detailSession, setDetailSession] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState([])
  const [modeFilter, setModeFilter] = useState('')
  const [profileFilter, setProfileFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  // Deduplicate by email — keep latest session per student
  const [dedup, setDedup] = useState(false)

  const filtered = useMemo(() => {
    let data = [...sessions]

    // Deduplicate by email if enabled
    if (dedup) {
      const seen = new Map()
      data.forEach((r) => {
        const key = r.student_email || r.id
        const existing = seen.get(key)
        if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
          seen.set(key, r)
        }
      })
      data = Array.from(seen.values())
    }
    if (search) {
      const s = search.toLowerCase()
      data = data.filter(
        (r) =>
          r.student_name?.toLowerCase().includes(s) ||
          r.student_email?.toLowerCase().includes(s)
      )
    }
    if (domainFilter.length) {
      data = data.filter((r) => domainFilter.includes(r.recommended_domain))
    }
    if (modeFilter) {
      data = data.filter((r) => r.quiz_mode === modeFilter)
    }
    if (profileFilter) {
      data = data.filter((r) => r.primary_profile === profileFilter)
    }
    if (yearFilter) {
      data = data.filter((r) => r.year_of_study === yearFilter)
    }
    // Sort
    data.sort((a, b) => {
      const aVal = a[sort.key] ?? ''
      const bVal = b[sort.key] ?? ''
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sort.dir === 'desc' ? -cmp : cmp
    })
    return data
  }, [sessions, search, domainFilter, modeFilter, profileFilter, yearFilter, sort, dedup])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const toggleSort = (key) => {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const toggleDomain = (d) => {
    setDomainFilter((f) => (f.includes(d) ? f.filter((x) => x !== d) : [...f, d]))
  }

  const toggleSelect = (id) => {
    setSelected((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === pageData.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(pageData.map((r) => r.id)))
    }
  }

  const SortIcon = ({ col }) => (
    <span className="ml-1 opacity-40 inline-flex">
      {sort.key === col ? (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
    </span>
  )

  const columns = [
    { key: 'student_name', label: 'Name' },
    { key: 'student_email', label: 'Email' },
    { key: 'year_of_study', label: 'Year' },
    { key: 'recommended_domain', label: 'Domain' },
    { key: 'primary_profile', label: 'Profile' },
    { key: 'quiz_mode', label: 'Mode' },
    { key: 'completion_rate', label: 'Completed' },
    { key: 'created_at', label: 'Date' },
  ]

  return (
    <div>
      {/* Filters — single horizontal row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="input text-sm w-56"
        />

        <select
          value={modeFilter}
          onChange={(e) => { setModeFilter(e.target.value); setPage(0) }}
          className="input text-sm"
        >
          <option value="">All Modes</option>
          <option value="general">General</option>
          <option value="advanced">Advanced</option>
          <option value="validate">Validate</option>
        </select>

        <select
          value={profileFilter}
          onChange={(e) => { setProfileFilter(e.target.value); setPage(0) }}
          className="input text-sm"
        >
          <option value="">All Profiles</option>
          {Object.entries(PROFILE_NAMES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => { setYearFilter(e.target.value); setPage(0) }}
          className="input text-sm"
        >
          <option value="">All Years</option>
          {['1st', '2nd', '3rd', '4th', 'Graduate'].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Domain filter chips inline */}
        <div className="flex flex-wrap items-center gap-1">
          {Object.entries(DOMAIN_NAMES).map(([key, name]) => (
            <button
              key={key}
              onClick={() => { toggleDomain(key); setPage(0) }}
              className={`tag text-[11px] cursor-pointer transition-all px-2 py-0.5 ${domainFilter.includes(key) ? 'ring-2' : 'opacity-50'}`}
              style={{
                borderColor: DOMAIN_COLORS[key],
                color: domainFilter.includes(key) ? DOMAIN_COLORS[key] : 'var(--muted)',
                ringColor: DOMAIN_COLORS[key],
              }}
              title={name}
            >
              <DomainDot domain={key} />
              {name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border-l pl-2 ml-auto" style={{ borderColor: 'var(--border)' }}>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={dedup}
              onChange={(e) => { setDedup(e.target.checked); setPage(0) }}
            />
            Deduplicate
          </label>
        </div>
      </div>

      {/* Export & Delete buttons */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => onExport?.(filtered)}
          className="btn-secondary text-sm"
        >
          Export CSV ({filtered.length})
        </button>
        {selected.size > 0 && (
          <>
            <button
              onClick={() => onExport?.(filtered.filter((r) => selected.has(r.id)))}
              className="btn-secondary text-sm"
            >
              Export Selected ({selected.size})
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${selected.size} selected session(s)? This cannot be undone.`)) {
                  onDelete?.(Array.from(selected))
                  setSelected(new Set())
                }
              }}
              className="btn-secondary text-sm inline-flex items-center gap-1"
              style={{ color: '#f43f5e', borderColor: '#f43f5e40' }}
            >
              <Trash2 size={13} /> Delete Selected ({selected.size})
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ color: 'var(--text)' }}>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  checked={pageData.length > 0 && selected.size === pageData.length}
                  onChange={toggleAll}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="p-2 text-left font-mono text-xs tracking-wider cursor-pointer whitespace-nowrap"
                  style={{ color: 'var(--muted)' }}
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </th>
              ))}
              <th className="p-2 text-right font-mono text-xs tracking-wider whitespace-nowrap" style={{ color: 'var(--muted)' }}>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr
                key={row.id}
                className="border-b cursor-pointer transition-colors hover:bg-white/5"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => setDetailSession(row)}
              >
                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                  />
                </td>
                <td className="p-2 whitespace-nowrap">{row.student_name}</td>
                <td className="p-2 whitespace-nowrap">{row.student_email}</td>
                <td className="p-2">{row.year_of_study || '—'}</td>
                <td className="p-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <DomainDot domain={row.recommended_domain} />
                    {DOMAIN_NAMES[row.recommended_domain] || row.recommended_domain}
                  </span>
                </td>
                <td className="p-2 capitalize">{row.primary_profile || '—'}</td>
                <td className="p-2 capitalize">{row.quiz_mode || '—'}</td>
                <td className="p-2">
                  {row.completion_rate != null ? `${Math.round(row.completion_rate)}%` : '—'}
                </td>
                <td className="p-2 whitespace-nowrap">
                  {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      if (confirm('Delete this session?')) {
                        onDelete?.([row.id])
                      }
                    }}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    style={{ color: '#f43f5e' }}
                    title="Delete session"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="p-8 text-center" style={{ color: 'var(--muted)' }}>
                  No sessions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {filtered.length} total · Page {page + 1} of {totalPages}
          </span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
            className="input text-xs py-1"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary text-xs disabled:opacity-30"
          >
            <ChevronLeft size={14} className="inline mr-1" /> Prev
          </button>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary text-xs disabled:opacity-30"
          >
            Next <ChevronRight size={14} className="inline ml-1" />
          </button>
        </div>
      </div>

      {/* Detail slide-out */}
      {detailSession && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailSession(null)} />
          <div
            className="relative w-full max-w-md overflow-y-auto p-6"
            style={{ backgroundColor: 'var(--bg)' }}
          >
            <button
              onClick={() => setDetailSession(null)}
              className="absolute top-4 right-4 text-lg"
              style={{ color: 'var(--muted)' }}
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-[700] mb-1" style={{ color: 'var(--text)' }}>
              {detailSession.student_name}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              {detailSession.student_email}
            </p>

            <div className="space-y-3 text-sm" style={{ color: 'var(--muted2)' }}>
              <div>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>DOMAIN </span>
                <span style={{ color: DOMAIN_COLORS[detailSession.recommended_domain] }}>
                  {DOMAIN_NAMES[detailSession.recommended_domain]}
                </span>
              </div>
              <div>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>PROFILE </span>
                <span className="capitalize">{detailSession.primary_profile}</span>
              </div>
              <div>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>MODE </span>
                <span className="capitalize">{detailSession.quiz_mode}</span>
              </div>
              <div>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>YEAR </span>
                <span>{detailSession.year_of_study || '—'}</span>
              </div>
              <div>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>TIME </span>
                <span>{detailSession.time_available || '—'}</span>
              </div>
              <div>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>PRIORITY </span>
                <span>{detailSession.priority || '—'}</span>
              </div>
              <div>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>COMPLETION </span>
                <span>{detailSession.completion_rate ? `${Math.round(detailSession.completion_rate)}%` : '—'}</span>
              </div>
              <div>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>DATE </span>
                <span>{detailSession.created_at ? new Date(detailSession.created_at).toLocaleString() : '—'}</span>
              </div>
            </div>

            {/* Score breakdown */}
            {detailSession.score_breakdown && (
              <div className="mt-6">
                <h4 className="font-mono text-xs tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
                  SCORE BREAKDOWN
                </h4>
                <div className="space-y-2">
                  {Object.entries(
                    typeof detailSession.score_breakdown === 'string'
                      ? JSON.parse(detailSession.score_breakdown)
                      : detailSession.score_breakdown
                  ).sort(([, a], [, b]) => b - a).map(([profile, score]) => (
                    <div key={profile} className="flex items-center gap-2">
                      <span className="text-xs capitalize w-20" style={{ color: 'var(--muted2)' }}>{profile}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(0, (score / 20) * 100)}%`,
                            backgroundColor: 'var(--accent)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono w-6 text-right" style={{ color: 'var(--muted)' }}>{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All answers */}
            {detailSession.answers && (
              <div className="mt-6">
                <h4 className="font-mono text-xs tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
                  ANSWERS
                </h4>
                <div className="space-y-2 text-xs" style={{ color: 'var(--muted2)' }}>
                  {(typeof detailSession.answers === 'string'
                    ? JSON.parse(detailSession.answers)
                    : detailSession.answers || []
                  ).map((ans, i) => (
                    <div key={i} className="p-2 rounded" style={{ backgroundColor: 'var(--bg-card)' }}>
                      <span className="font-mono" style={{ color: 'var(--muted)' }}>Q{i + 1}: </span>
                      {ans.optionText || ans.optionId || JSON.stringify(ans)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
