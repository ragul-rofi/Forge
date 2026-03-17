import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { createOutboundCall } from '../lib/vapi.js'

const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Initiate outbound phone call
router.post('/srini-call-outbound', async (req, res) => {
  try {
    const {
      phone,
      studentName,
      studentEmail,
      domain,
      profileType,
      timeAvailable,
      priority,
      quizEmotion,
      yearOfStudy,
      domainContext,
      salaryData
    } = req.body

    // Validate phone number
    if (!phone || !phone.startsWith('+')) {
      return res.status(400).json({ error: 'Invalid phone number format. Must start with +' })
    }

    // Create assistant overrides
    const assistantOverrides = {
      variableValues: {
        student_name: studentName,
        domain: domain,
        profile_type: profileType || 'Explorer',
        time_available: timeAvailable || '6 months',
        priority: priority || 'balanced',
        quiz_emotion: quizEmotion || 'curiosity',
        year_of_study: yearOfStudy || '2nd year',
        domain_context: domainContext || `Domain: ${domain}`,
        salary_data: salaryData || 'Salary data not available'
      }
    }

    // Create outbound call via Vapi
    const callData = await createOutboundCall({
      phoneNumber: phone,
      assistantId: process.env.VAPI_ASSISTANT_ID,
      assistantOverrides
    })

    // Log to Supabase
    const { error: insertError } = await supabase
      .from('voice_sessions')
      .insert({
        student_name: studentName,
        student_email: studentEmail,
        vapi_call_id: callData.id,
        call_type: 'outbound',
        call_status: 'initiated',
        domain: domain,
        profile_type: profileType
      })

    if (insertError) {
      console.error('Error logging voice session:', insertError)
    }

    res.json({ success: true, callId: callData.id })
  } catch (error) {
    console.error('Outbound call error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Log web call session
router.post('/srini-log-session', async (req, res) => {
  try {
    const {
      vapiCallId,
      studentName,
      studentEmail,
      domain,
      profileType,
      quizSessionId
    } = req.body

    const { error } = await supabase
      .from('voice_sessions')
      .insert({
        student_name: studentName,
        student_email: studentEmail,
        vapi_call_id: vapiCallId,
        call_type: 'web',
        call_status: 'initiated',
        domain: domain,
        profile_type: profileType,
        quiz_session_id: quizSessionId
      })

    if (error) throw error

    res.json({ success: true })
  } catch (error) {
    console.error('Log session error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
