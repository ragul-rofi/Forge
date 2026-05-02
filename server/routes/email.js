import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { sendQuizResultEmail } from '../lib/resend.js'

const router = Router()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

router.post('/send-result-email', async (req, res) => {
  try {
    const { name, email, domain, sessionId } = req.body

    if (!name || !email || !domain || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields: name, email, domain, sessionId' })
    }

    // Fetch session for full data
    let session = null
    let roadmap = null
    let profile = null

    if (!sessionId.startsWith('local-')) {
      const { data } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
      session = data

      if (session?.email_sent) {
        return res.json({ success: true, skipped: true, reason: 'already-sent' })
      }

      profile = session?.primary_profile
    }

    // Try to get roadmap data
    try {
      const { DOMAIN_ROADMAPS } = await import('../lib/roadmaps.js')
      roadmap = DOMAIN_ROADMAPS[domain]
    } catch {
      // Roadmap import may fail; that's okay
    }

    // Fire-and-forget: send email asynchronously without blocking response
    sendQuizResultEmail(email, {
      name,
      domain,
      sessionId,
      profile: profile || 'explorer',
      roadmap,
    })
      .then((result) => {
        console.log(`[Resend] Email sent successfully: ${result.id}`)
        // Mark email as sent in Supabase after successful send
        if (!sessionId.startsWith('local-')) {
          return supabase
            .from('quiz_sessions')
            .update({ email_sent: true })
            .eq('id', sessionId)
        }
      })
      .catch((err) => {
        console.error('[Resend] Email send failed:', err.message)
      })

    // Respond immediately without waiting for email
    res.json({ success: true, emailQueued: true })
  } catch (err) {
    console.error('Email route error:', err)
    res.status(500).json({ error: 'Failed to process request', details: err.message })
  }
})

export default router
