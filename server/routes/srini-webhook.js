import express from 'express'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Vapi webhook endpoint for call events
router.post('/srini-webhook', async (req, res) => {
  try {
    const event = req.body

    console.log('Vapi webhook received:', event.message?.type)

    switch (event.message?.type) {
      case 'end-of-call-report': {
        const { call, transcript, summary, recordingUrl } = event.message

        // Extract student commitment from transcript
        const commitment = extractCommitment(transcript)

        // Detect primary language
        const primaryLanguage = detectPrimaryLanguage(transcript)

        // Update voice_sessions in Supabase
        const { error: updateError } = await supabase
          .from('voice_sessions')
          .update({
            call_status: 'ended',
            duration_seconds: Math.floor((new Date(call.endedAt) - new Date(call.startedAt)) / 1000),
            recording_url: recordingUrl,
            transcript: transcript,
            summary: summary,
            student_commitment: commitment,
            language_used: primaryLanguage,
            sentiment_score: call.analysis?.sentiment,
            updated_at: new Date().toISOString()
          })
          .eq('vapi_call_id', call.id)

        if (updateError) {
          console.error('Error updating voice session:', updateError)
        }

        // Get session data for email
        const { data: sessionData } = await supabase
          .from('voice_sessions')
          .select('*')
          .eq('vapi_call_id', call.id)
          .single()

        if (sessionData) {
          // Send post-call email (non-blocking)
          sendPostCallEmail({
            email: sessionData.student_email,
            name: sessionData.student_name,
            domain: sessionData.domain,
            summary: summary || 'Your conversation with SRINI has been recorded.',
            commitment: commitment,
            recordingUrl: recordingUrl,
            transcript: transcript
          }).catch(err => console.error('Email send error:', err))
        }

        break
      }

      case 'call-started': {
        const { call } = event.message

        // Update call status to active
        await supabase
          .from('voice_sessions')
          .update({
            call_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('vapi_call_id', call.id)

        break
      }

      case 'call-failed': {
        const { call } = event.message

        // Update call status to failed
        await supabase
          .from('voice_sessions')
          .update({
            call_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('vapi_call_id', call.id)

        break
      }
    }

    res.sendStatus(200)
  } catch (error) {
    console.error('Webhook error:', error)
    res.sendStatus(500)
  }
})

// Extract commitment from transcript
function extractCommitment(transcript) {
  if (!transcript) return null

  const lines = transcript.split('\n')
  const commitIdx = lines.findIndex(l =>
    l.toLowerCase().includes('commit') ||
    l.toLowerCase().includes('48 hours') ||
    l.toLowerCase().includes('one thing')
  )

  if (commitIdx >= 0 && lines[commitIdx + 1]) {
    return lines[commitIdx + 1].replace(/^(Student|User|Assistant|SRINI):\s*/i, '').trim()
  }

  return null
}

// Detect primary language from transcript
function detectPrimaryLanguage(transcript) {
  if (!transcript) return 'en'

  // Simple detection based on character sets
  if (/[\u0B80-\u0BFF]/.test(transcript)) return 'ta' // Tamil
  if (/[\u0900-\u097F]/.test(transcript)) return 'hi' // Hindi
  if (/[\u0C00-\u0C7F]/.test(transcript)) return 'te' // Telugu
  if (/[\u0D00-\u0D7F]/.test(transcript)) return 'ml' // Malayalam
  if (/[\u0C80-\u0CFF]/.test(transcript)) return 'kn' // Kannada

  return 'en' // Default to English
}

// Send post-call email
async function sendPostCallEmail({ email, name, domain, summary, commitment, recordingUrl, transcript }) {
  const dashboardUrl = `${process.env.CLIENT_URL}/dashboard`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; }
    .container { background: #0c0c0c; color: #f0ece4; padding: 40px; max-width: 600px; margin: 0 auto; }
    .header { margin-bottom: 32px; }
    .title { font-size: 28px; margin-bottom: 4px; color: #f0ece4; }
    .subtitle { color: #666; font-size: 12px; letter-spacing: 2px; }
    .section { background: #141414; border: 1px solid #2e2e2e; padding: 20px; margin: 24px 0; border-radius: 8px; }
    .section-title { color: #666; font-size: 10px; letter-spacing: 3px; margin-bottom: 12px; text-transform: uppercase; }
    .commitment-box { background: #0f2d1a; border: 1px solid #1a5c2e; padding: 20px; margin: 24px 0; border-radius: 8px; }
    .commitment-title { color: #22c55e; font-size: 10px; letter-spacing: 3px; margin-bottom: 12px; text-transform: uppercase; }
    .commitment-text { font-size: 18px; font-weight: 700; color: #f0ece4; margin-bottom: 8px; }
    .commitment-note { color: #666; font-size: 12px; }
    .domain-box { border-left: 3px solid #3b82f6; padding-left: 16px; margin: 24px 0; }
    .link { color: #3b82f6; text-decoration: none; }
    .footer { color: #444; font-size: 12px; margin-top: 32px; padding-top: 32px; border-top: 1px solid #2e2e2e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">FORGE</h1>
      <p class="subtitle">POST-CALL SUMMARY FROM SRINI</p>
    </div>

    <p>Hey ${name},</p>
    <p>Here's what came out of your call with SRINI today.</p>

    <div class="section">
      <p class="section-title">CALL SUMMARY</p>
      <p>${summary}</p>
    </div>

    ${commitment ? `
    <div class="commitment-box">
      <p class="commitment-title">YOUR 48-HOUR COMMITMENT</p>
      <p class="commitment-text">${commitment}</p>
      <p class="commitment-note">You said this. Hold yourself to it.</p>
    </div>
    ` : ''}

    <div class="domain-box">
      <p style="color: #666; font-size: 11px; margin-bottom: 4px;">YOUR PATH</p>
      <p style="font-size: 20px; font-weight: 700; color: #3b82f6; margin-bottom: 8px;">${domain}</p>
      <p style="margin-bottom: 8px;">Phase 1 starts here →</p>
      <a href="${dashboardUrl}" class="link">Open your FORGE dashboard →</a>
    </div>

    ${recordingUrl ? `
    <p style="margin: 24px 0;">
      <a href="${recordingUrl}" class="link" style="font-size: 12px;">🎙 Listen to your call recording →</a>
    </p>
    ` : ''}

    <div class="footer">
      <p>FORGE — Don't find your path. Forge it.</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Your SRINI call summary — ${domain} path`,
    html: htmlContent
  })

  // Mark email as sent
  await supabase
    .from('voice_sessions')
    .update({ email_sent: true })
    .eq('student_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
}

export default router
