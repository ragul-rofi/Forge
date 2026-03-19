import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { sendDigestEmail } from '../lib/mailtrap.js'

const router = Router()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// POST /api/send-digest — called by cron job (e.g., Vercel Cron)
router.post('/send-digest', async (req, res) => {
  try {
    // Verify cron secret
    const cronSecret = req.headers['x-cron-secret'] || req.body.secret
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Fetch all active students who opted in to weekly digest
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('weekly_digest', true)
      .not('email', 'is', null)

    if (error) throw error
    if (!students || students.length === 0) {
      return res.json({ sent: 0, message: 'No eligible students' })
    }

    let sent = 0
    let failed = 0

    for (const student of students) {
      try {
        // Determine current phase
        let currentPhase = 1
        for (let i = 1; i <= 5; i++) {
          if (student.phase_progress?.[`phase_${i}_complete`]) {
            currentPhase = i + 1
          }
        }
        if (currentPhase > 5) currentPhase = 5

        const tasksRemaining = student.phase_progress?.[`phase_${currentPhase}`]
          ? 'some tasks checked'
          : 'no tasks started yet'

        const daysSinceStart = student.created_at
          ? Math.floor((Date.now() - new Date(student.created_at).getTime()) / 86400000)
          : 0

        await sendDigestEmail({
          name: student.name,
          email: student.email,
          domain: student.domain,
          currentPhase,
          tasksRemaining,
          daysSinceStart,
          streakDays: student.streak_days || 0,
        })

        sent++
      } catch (emailErr) {
        console.error(`Failed to send digest to ${student.email}:`, emailErr)
        failed++
      }
    }

    res.json({ sent, failed, total: students.length })
  } catch (err) {
    console.error('Weekly digest error:', err)
    res.status(500).json({ error: 'Failed to process digest' })
  }
})

// POST /api/unsubscribe-digest — student unsubscribes
router.post('/unsubscribe-digest', async (req, res) => {
  try {
    const { studentId } = req.body
    if (!studentId) return res.status(400).json({ error: 'studentId required' })

    const { error } = await supabase
      .from('students')
      .update({ weekly_digest: false })
      .eq('id', studentId)

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    res.status(500).json({ error: 'Failed to unsubscribe' })
  }
})

export default router
