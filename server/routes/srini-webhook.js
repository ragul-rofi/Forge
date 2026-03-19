import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { sendPostCallEmail } from '../lib/mailtrap.js'

const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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
            recordingUrl: recordingUrl
          })
            .then(async () => {
              await supabase
                .from('voice_sessions')
                .update({ email_sent: true })
                .eq('student_email', sessionData.student_email)
                .order('created_at', { ascending: false })
                .limit(1)
            })
            .catch((err) => console.error('Email send error:', err))
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

export default router
