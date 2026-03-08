import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'

const router = Router()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

router.get('/export/csv', async (req, res) => {
  try {
    // Check for admin auth header (simple token check)
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: sessions, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const headers = [
      'id', 'student_name', 'student_email', 'year_of_study', 'department',
      'recommended_domain', 'second_domain', 'primary_profile', 'secondary_profile',
      'quiz_mode', 'time_available', 'priority', 'completion_rate',
      'score_breakdown', 'answers', 'validate_target', 'validate_verdict',
      'email_sent', 'created_at',
    ]

    const rows = (sessions || []).map((row) =>
      headers.map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
        const str = String(val)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="forge-export-${new Date().toISOString().split('T')[0]}.csv"`)
    res.send(csv)
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: 'Export failed', details: err.message })
  }
})

export default router
