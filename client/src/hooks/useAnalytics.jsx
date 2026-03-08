import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAnalytics(timeRange = '7d') {
  const [data, setData] = useState({
    totalSessions: 0,
    sessionsThisWeek: 0,
    completionRate: 0,
    popularDomain: '-',
    domainDistribution: [],
    modeUsage: [],
    profileDistribution: [],
    gatewayInsights: { time: [], priority: [] },
    q12Answers: [],
    dropOff: [],
    validateVerdicts: [],
    recentSessions: [],
    trendObservation: '',
  })
  const [loading, setLoading] = useState(true)

  const getRangeDate = useCallback(() => {
    const now = new Date()
    switch (timeRange) {
      case '7d': return new Date(now - 7 * 86400000).toISOString()
      case '30d': return new Date(now - 30 * 86400000).toISOString()
      case '90d': return new Date(now - 90 * 86400000).toISOString()
      default: return null
    }
  }, [timeRange])

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('quiz_sessions').select('*')
      const rangeDate = getRangeDate()
      if (rangeDate) query = query.gte('created_at', rangeDate)

      const { data: sessions, error } = await query.order('created_at', { ascending: false })
      if (error) throw error

      if (!sessions || sessions.length === 0) {
        setLoading(false)
        return
      }

      // Total sessions
      const totalSessions = sessions.length

      // Sessions this week
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const sessionsThisWeek = sessions.filter(s => s.created_at >= weekAgo).length

      // Completion rate
      const completed = sessions.filter(s => s.completion_rate === 100).length
      const completionRate = Math.round((completed / totalSessions) * 100)

      // Domain distribution
      const domainCounts = {}
      sessions.forEach(s => {
        if (s.recommended_domain) {
          domainCounts[s.recommended_domain] = (domainCounts[s.recommended_domain] || 0) + 1
        }
      })
      const domainDistribution = Object.entries(domainCounts)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)

      const popularDomain = domainDistribution[0]?.domain || '-'

      // Mode usage
      const modeCounts = {}
      sessions.forEach(s => {
        modeCounts[s.quiz_mode] = (modeCounts[s.quiz_mode] || 0) + 1
      })
      const modeUsage = Object.entries(modeCounts).map(([mode, count]) => ({ mode, count }))

      // Profile distribution
      const profileCounts = {}
      const allProfiles = ['maker', 'thinker', 'protector', 'creator', 'leader', 'helper', 'explorer']
      allProfiles.forEach(p => { profileCounts[p] = 0 })
      sessions.forEach(s => {
        if (s.primary_profile) profileCounts[s.primary_profile]++
      })
      const profileDistribution = allProfiles.map(p => ({ profile: p, count: profileCounts[p] }))

      // Gateway insights
      const timeCounts = { '3plus_yr': 0, '1_2yr': 0, 'under_6mo': 0, 'graduated': 0 }
      const priorityCounts = { 'salary_first': 0, 'interest_first': 0, 'balanced': 0, 'unknown': 0 }
      sessions.forEach(s => {
        if (s.time_available && timeCounts[s.time_available] !== undefined) timeCounts[s.time_available]++
        if (s.priority && priorityCounts[s.priority] !== undefined) priorityCounts[s.priority]++
      })

      // Q12 answers
      const q12Counts = { FAST_TRACK: 0, CLARIFY: 0, CONFIRM: 0, COMMIT: 0 }
      sessions.forEach(s => {
        if (s.all_answers) {
          const q12 = s.all_answers.find(a => a.questionId === 'g12')
          if (q12?.tag && q12Counts[q12.tag] !== undefined) q12Counts[q12.tag]++
        }
      })

      // Validate verdicts
      const verdictCounts = { strong: 0, caution: 0, redirect: 0 }
      sessions.filter(s => s.quiz_mode === 'validate').forEach(s => {
        if (s.validate_verdict && verdictCounts[s.validate_verdict] !== undefined) {
          verdictCounts[s.validate_verdict]++
        }
      })

      // Trend observation
      const aiRedirected = sessions.filter(s =>
        s.validate_target === 'ai' && s.validate_verdict === 'redirect'
      ).length
      const aiTotal = sessions.filter(s => s.validate_target === 'ai').length
      let trendObservation = ''
      if (aiTotal > 0) {
        const pct = Math.round((aiRedirected / aiTotal) * 100)
        trendObservation = `${pct}% of students who wanted AI/ML were redirected to Data Analytics due to timeline constraints.`
      }

      setData({
        totalSessions,
        sessionsThisWeek,
        completionRate,
        popularDomain,
        domainDistribution,
        modeUsage,
        profileDistribution,
        gatewayInsights: {
          time: Object.entries(timeCounts).map(([label, count]) => ({ label, count })),
          priority: Object.entries(priorityCounts).map(([label, count]) => ({ label, count })),
        },
        q12Answers: Object.entries(q12Counts).map(([label, count]) => ({ label, count })),
        dropOff: [],
        validateVerdicts: Object.entries(verdictCounts).map(([label, count]) => ({ label, count })),
        recentSessions: sessions.slice(0, 10),
        trendObservation,
      })
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [getRangeDate])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { data, loading, refetch: fetchAnalytics }
}
