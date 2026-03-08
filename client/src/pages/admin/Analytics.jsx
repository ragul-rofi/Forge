import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../../lib/constants'
import AnalyticsChart from '../../components/admin/AnalyticsChart'

const TIME_RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: null },
]

export default function Analytics() {
  const [sessions, setSessions] = useState([])
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setSessions(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!range) return sessions
    const cutoff = new Date(Date.now() - range * 24 * 60 * 60 * 1000)
    return sessions.filter((s) => new Date(s.created_at) >= cutoff)
  }, [sessions, range])

  // Chart 1: Domain Popularity Over Time (line chart)
  const domainOverTime = useMemo(() => {
    const dateMap = {}
    filtered.forEach((s) => {
      if (!s.recommended_domain || !s.created_at) return
      const date = s.created_at.split('T')[0]
      if (!dateMap[date]) dateMap[date] = {}
      dateMap[date][s.recommended_domain] = (dateMap[date][s.recommended_domain] || 0) + 1
    })

    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, domains]) => ({
        name: date.slice(5), // MM-DD
        ...domains,
      }))
  }, [filtered])

  const domainKeys = Object.keys(DOMAIN_NAMES)
  const domainColorArray = domainKeys.map((k) => DOMAIN_COLORS[k])

  // Chart 2: Profile Distribution (radar)
  const profileDist = useMemo(() => {
    const counts = { maker: 0, thinker: 0, protector: 0, creator: 0, leader: 0, helper: 0, explorer: 0 }
    filtered.forEach((s) => {
      if (s.primary_profile && counts[s.primary_profile] !== undefined) {
        counts[s.primary_profile]++
      }
    })
    return Object.entries(counts).map(([profile, count]) => ({
      name: profile.charAt(0).toUpperCase() + profile.slice(1),
      count,
    }))
  }, [filtered])

  // Chart 3: Gateway Insights (time + priority)
  const gatewayTime = useMemo(() => {
    const counts = {}
    filtered.forEach((s) => {
      if (s.time_available) {
        counts[s.time_available] = (counts[s.time_available] || 0) + 1
      }
    })
    return Object.entries(counts).map(([label, count]) => ({ name: label, count }))
  }, [filtered])

  const gatewayPriority = useMemo(() => {
    const counts = {}
    filtered.forEach((s) => {
      if (s.priority) {
        counts[s.priority] = (counts[s.priority] || 0) + 1
      }
    })
    return Object.entries(counts).map(([label, count]) => ({ name: label, count }))
  }, [filtered])

  // Chart 4: Motivation / Fear (Q12 style — what brought them)
  const motivationData = useMemo(() => {
    const counts = { Fear: 0, Confusion: 0, Curiosity: 0, Urgency: 0 }
    filtered.forEach((s) => {
      // Check answers for Q12-style data (motivation question)
      const answers = typeof s.answers === 'string' ? JSON.parse(s.answers || '[]') : (s.answers || [])
      const motivationAns = answers.find((a) => a.signal === 'motivation')
      if (motivationAns) {
        const text = (motivationAns.optionText || '').toLowerCase()
        if (text.includes('fear') || text.includes('scared') || text.includes('behind')) counts.Fear++
        else if (text.includes('confus') || text.includes('no idea') || text.includes("don't know")) counts.Confusion++
        else if (text.includes('curio') || text.includes('excit') || text.includes('interest')) counts.Curiosity++
        else if (text.includes('urgen') || text.includes('need') || text.includes('fast') || text.includes('money')) counts.Urgency++
      }
    })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [filtered])

  // Chart 5: Drop-off by Question
  const dropOff = useMemo(() => {
    const maxQ = 25
    const counts = Array.from({ length: maxQ }, (_, i) => ({
      name: `Q${i + 1}`,
      dropoffs: 0,
    }))
    filtered.forEach((s) => {
      const answers = typeof s.answers === 'string' ? JSON.parse(s.answers || '[]') : (s.answers || [])
      const total = s.quiz_mode === 'advanced' ? 25 : s.quiz_mode === 'validate' ? 8 : 12
      if (s.completion_rate < 100 && answers.length < total) {
        const dropAt = answers.length
        if (dropAt >= 0 && dropAt < maxQ) {
          counts[dropAt].dropoffs++
        }
      }
    })
    return counts.filter((c) => c.dropoffs > 0)
  }, [filtered])

  // Chart 6: Validate Verdicts
  const verdicts = useMemo(() => {
    const counts = { Strong: 0, Caution: 0, Redirect: 0 }
    filtered.forEach((s) => {
      if (s.quiz_mode === 'validate' && s.validate_verdict) {
        const v = s.validate_verdict.charAt(0).toUpperCase() + s.validate_verdict.slice(1)
        if (counts[v] !== undefined) counts[v]++
      }
    })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [filtered])

  // Trend observation
  const trendText = useMemo(() => {
    if (filtered.length < 5) return null

    const validateSessions = filtered.filter((s) => s.quiz_mode === 'validate')
    if (validateSessions.length >= 3) {
      const redirected = validateSessions.filter((s) => s.validate_verdict === 'redirect')
      const pct = Math.round((redirected.length / validateSessions.length) * 100)
      if (pct > 20) {
        // Find most common redirect target
        const targets = {}
        redirected.forEach((s) => {
          if (s.validate_target) targets[s.validate_target] = (targets[s.validate_target] || 0) + 1
        })
        const topTarget = Object.entries(targets).sort((a, b) => b[1] - a[1])[0]
        if (topTarget) {
          const reDomain = {}
          redirected.forEach((s) => {
            if (s.validate_target === topTarget[0] && s.recommended_domain) {
              reDomain[s.recommended_domain] = (reDomain[s.recommended_domain] || 0) + 1
            }
          })
          const topReDomain = Object.entries(reDomain).sort((a, b) => b[1] - a[1])[0]
          if (topReDomain) {
            return `This period, ${pct}% of students who wanted ${DOMAIN_NAMES[topTarget[0]] || topTarget[0]} were redirected to ${DOMAIN_NAMES[topReDomain[0]] || topReDomain[0]} due to timeline constraints.`
          }
        }
      }
    }

    // Fallback: most popular domain
    const domainCounts = {}
    filtered.forEach((s) => {
      if (s.recommended_domain) domainCounts[s.recommended_domain] = (domainCounts[s.recommended_domain] || 0) + 1
    })
    const top = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]
    if (top) {
      const pct = Math.round((top[1] / filtered.length) * 100)
      return `${DOMAIN_NAMES[top[0]] || top[0]} accounts for ${pct}% of all recommendations in this period.`
    }

    return null
  }, [filtered])

  const handleExportPDF = () => {
    window.print()
  }

  if (loading) {
    return <p style={{ color: 'var(--muted)' }}>Loading analytics...</p>
  }

  return (
    <div className="print:bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-[700]" style={{ color: 'var(--text)' }}>Analytics</h2>
        <div className="flex items-center gap-2">
          {TIME_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.days)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                range === r.days ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              style={{ color: range === r.days ? 'var(--text)' : 'var(--muted)' }}
            >
              {r.label}
            </button>
          ))}
          <button onClick={handleExportPDF} className="btn-secondary text-xs ml-2">
            Export PDF
          </button>
        </div>
      </div>

      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        {filtered.length} sessions in selected period
      </p>

      {/* Trend callout */}
      {trendText && (
        <div className="card p-4 mb-6 border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
          <p className="font-mono text-xs tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
            TREND OBSERVATION
          </p>
          <p className="text-sm" style={{ color: 'var(--muted2)' }}>{trendText}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Chart 1: Domain over time */}
        <AnalyticsChart
          type="line"
          title="DOMAIN POPULARITY OVER TIME"
          data={domainOverTime}
          dataKeys={domainKeys}
          colors={domainColorArray}
          height={280}
        />

        {/* Chart 2: Profile distribution */}
        <AnalyticsChart
          type="radar"
          title="PROFILE DISTRIBUTION"
          data={profileDist}
          dataKeys={['count']}
          colors={['var(--accent)']}
          height={280}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Chart 3: Gateway — Time */}
        <AnalyticsChart
          type="bar"
          title="TIME AVAILABLE (GATEWAY)"
          data={gatewayTime}
          dataKeys={['count']}
          colors={['#60a5fa']}
          height={250}
        />

        {/* Chart 3b: Gateway — Priority */}
        <AnalyticsChart
          type="bar"
          title="PRIORITY (GATEWAY)"
          data={gatewayPriority}
          dataKeys={['count']}
          colors={['#a78bfa']}
          height={250}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Chart 4: Motivation */}
        {motivationData.length > 0 && (
          <AnalyticsChart
            type="pie"
            title="WHAT BROUGHT THEM HERE"
            data={motivationData}
            dataKeys={['value']}
            colors={['#f43f5e', '#fbbf24', '#10b981', '#60a5fa']}
            height={280}
          />
        )}

        {/* Chart 5: Drop-off */}
        {dropOff.length > 0 && (
          <AnalyticsChart
            type="bar"
            title="DROP-OFF BY QUESTION"
            data={dropOff}
            dataKeys={['dropoffs']}
            colors={['#f43f5e']}
            height={280}
          />
        )}
      </div>

      {/* Chart 6: Validate Verdicts */}
      {verdicts.length > 0 && (
        <div className="max-w-md">
          <AnalyticsChart
            type="pie"
            title="VALIDATE MODE VERDICTS"
            data={verdicts}
            dataKeys={['value']}
            colors={['#10b981', '#fbbf24', '#f43f5e']}
            height={280}
          />
        </div>
      )}
    </div>
  )
}
