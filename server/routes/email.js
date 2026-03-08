import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { sendResultEmail } from '../lib/resend.js'

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
      profile = session?.primary_profile
    }

    // Try to get roadmap data
    try {
      const { DOMAIN_ROADMAPS } = await import('../lib/roadmaps.js')
      roadmap = DOMAIN_ROADMAPS[domain]
    } catch {
      // Roadmap import may fail; that's okay
    }

    const result = await sendResultEmail({
      name,
      email,
      domain,
      sessionId,
      profile: profile || 'explorer',
      roadmap,
    })

    // Mark email as sent in Supabase
    if (!sessionId.startsWith('local-')) {
      await supabase
        .from('quiz_sessions')
        .update({ email_sent: true })
        .eq('id', sessionId)
    }

    res.json({ success: true, id: result?.id })
  } catch (err) {
    console.error('Email send error:', err)
    res.status(500).json({ error: 'Failed to send email', details: err.message })
  }
})

export default router
