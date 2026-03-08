import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../../lib/constants'
import { PROFILE_NAMES } from '../../lib/profiles'
import StatsCard from '../../components/admin/StatsCard'
import AnalyticsChart from '../../components/admin/AnalyticsChart'

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

  const modeColors = ['var(--accent)', '#a78bfa', '#fbbf24']

  return (
    <div>
      <h2 className="text-2xl font-[700] mb-6" style={{ color: 'var(--text)' }}>Overview</h2>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="TOTAL SESSIONS" value={stats.total} />
        <StatsCard label="THIS WEEK" value={stats.thisWeek} />
        <StatsCard label="COMPLETION RATE" value={`${stats.completionRate}%`} />
        <StatsCard label="TOP DOMAIN" value={stats.topDomain} />
      </div>

      {/* Recent activity */}
      <div className="card p-5 mb-8">
        <h3 className="font-mono text-xs tracking-wider mb-4" style={{ color: 'var(--muted)' }}>
          RECENT ACTIVITY
        </h3>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No sessions yet</p>
          )}
          {recent.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--text)' }}>{maskName(s.student_name)}</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: DOMAIN_COLORS[s.recommended_domain] || 'var(--muted)' }}
                >
                  {DOMAIN_NAMES[s.recommended_domain] || '—'}
                </span>
                <span className="text-xs capitalize" style={{ color: 'var(--muted)' }}>
                  {s.primary_profile || ''}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {s.created_at ? new Date(s.created_at).toLocaleString() : ''}
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
          colors={domainDist.map((d) => d.color)}
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
