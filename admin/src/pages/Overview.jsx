import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../lib/constants'
import { PROFILE_NAMES } from '../lib/profiles'
import { Users, CalendarDays, CheckCircle2, Trophy } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import AnalyticsChart from '../components/AnalyticsChart'

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function Overview() {
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    completionRate: 0,
    topDomain: '—',
  })
  const [recent, setRecent] = useState([])
  const [domainDist, setDomainDist] = useState([])
  const [modeDist, setModeDist] = useState([])

  useEffect(() => {
    document.title = 'FORGE Admin — Overview'
    fetchData()

    // Realtime subscription for recent activity
    const channel = supabase
      .channel('admin-overview')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quiz_sessions' },
        (payload) => {
          setRecent((prev) => [payload.new, ...prev].slice(0, 10))
          fetchData() // Refresh stats
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchData() {
    try {
      const { data: sessions } = await supabase
        .from('quiz_sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!sessions) return

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const thisWeek = sessions.filter((s) => new Date(s.created_at) >= weekAgo)
      const completed = sessions.filter((s) => s.completion_rate >= 100)

      // Top domain this week
      const domainCounts = {}
      thisWeek.forEach((s) => {
        if (s.recommended_domain) {
          domainCounts[s.recommended_domain] = (domainCounts[s.recommended_domain] || 0) + 1
        }
      })
      const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]

      setStats({
        total: sessions.length,
        thisWeek: thisWeek.length,
        completionRate: sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0,
        topDomain: topDomain ? DOMAIN_NAMES[topDomain[0]] || topDomain[0] : '—',
      })

      // Recent 10
      setRecent(sessions.slice(0, 10))

      // Domain distribution (all time)
      const allDomainCounts = {}
      sessions.forEach((s) => {
        if (s.recommended_domain) {
          allDomainCounts[s.recommended_domain] = (allDomainCounts[s.recommended_domain] || 0) + 1
        }
      })
      setDomainDist(
        Object.entries(allDomainCounts).map(([key, count]) => ({
          name: DOMAIN_NAMES[key] || key,
          count,
          color: DOMAIN_COLORS[key],
        }))
      )

      // Mode distribution
      const modeCounts = { general: 0, advanced: 0, validate: 0 }
      sessions.forEach((s) => {
        if (s.quiz_mode && modeCounts[s.quiz_mode] !== undefined) {
          modeCounts[s.quiz_mode]++
        }
      })
      setModeDist(
        Object.entries(modeCounts).map(([mode, value]) => ({
          name: mode.charAt(0).toUpperCase() + mode.slice(1),
          value,
        }))
      )
    } catch (err) {
      console.error('Overview fetch error:', err)
    }
  }

  const maskName = (name) => {
    if (!name || name.length < 3) return name || '—'
    const parts = name.split(' ')
    return parts
      .map((p) => (p.length > 2 ? p.slice(0, 3) + '**' : p))
      .join(' ')
  }

  const modeColors = ['#38bdf8', '#a78bfa', '#f59e0b']

  return (
    <div>
      <h2 className="text-2xl font-[700] mb-6" style={{ color: 'var(--text)' }}>Overview</h2>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="TOTAL SESSIONS" value={stats.total} icon={Users} />
        <StatsCard label="THIS WEEK" value={stats.thisWeek} icon={CalendarDays} />
        <StatsCard label="COMPLETION RATE" value={`${stats.completionRate}%`} icon={CheckCircle2} />
        <StatsCard label="TOP DOMAIN" value={stats.topDomain} icon={Trophy} />
      </div>

      {/* Latest Sessions */}
      <div className="card p-5 mb-8">
        <h3 className="font-mono text-xs tracking-wider mb-4" style={{ color: 'var(--muted)' }}>
          LATEST SESSIONS
        </h3>
        <div className="space-y-1.5">
          {recent.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No sessions yet</p>
          )}
          {recent.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
                  style={{ backgroundColor: `${DOMAIN_COLORS[s.recommended_domain] || 'var(--muted)'}15`, color: DOMAIN_COLORS[s.recommended_domain] || 'var(--muted)' }}
                >
                  {(s.student_name || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {maskName(s.student_name)}
                    </span>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: `${DOMAIN_COLORS[s.recommended_domain] || '#888'}20`, color: DOMAIN_COLORS[s.recommended_domain] || 'var(--muted)' }}
                    >
                      {DOMAIN_NAMES[s.recommended_domain] || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] capitalize" style={{ color: 'var(--muted)' }}>
                      {s.primary_profile || ''}{s.quiz_mode ? ` · ${s.quiz_mode}` : ''}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] shrink-0 ml-3" style={{ color: 'var(--muted)' }}>
                {s.created_at ? formatRelativeTime(s.created_at) : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnalyticsChart
          type="bar"
          title="DOMAIN DISTRIBUTION"
          data={domainDist}
          dataKeys={['count']}
          perBarColors={domainDist.map((d) => d.color)}
          height={250}
        />
        <AnalyticsChart
          type="pie"
          title="MODE USAGE"
          data={modeDist}
          dataKeys={['value']}
          colors={modeColors}
          height={250}
        />
      </div>
    </div>
  )
}
