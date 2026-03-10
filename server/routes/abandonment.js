import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { sendAbandonmentEmail } from '../lib/resend.js'

const router = Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POST /api/check-abandoned — cron-triggered, sends recovery emails
// for sessions abandoned > 24 hours ago
router.post('/check-abandoned', async (req, res) => {
  const secret = req.headers['x-cron-secret']
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: abandoned, error } = await supabase
      .from('quiz_sessions')
      .select('id, student_name, student_email, abandoned_at')
      .not('abandoned_at', 'is', null)
      .lt('abandoned_at', cutoff)
      .lt('completion_rate', 100)
      .is('abandonment_email_sent', null)

    if (error) throw error
    if (!abandoned || abandoned.length === 0) {
      return res.json({ sent: 0 })
    }

    let sent = 0
    for (const session of abandoned) {
      if (!session.student_email) continue
      try {
        await sendAbandonmentEmail(session.student_name, session.student_email, session.id)
        await supabase
          .from('quiz_sessions')
          .update({ abandonment_email_sent: true })
          .eq('id', session.id)
        sent++
      } catch {
        // Continue with next session
      }
    }

    res.json({ sent })
  } catch (err) {
    console.error('Abandonment check error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
