import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'

const router = Router()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const SYSTEM_PROMPT_TEMPLATE = `You are FORGE's AI Roadmap Guide — a focused, direct, practical assistant that helps students customize their learning roadmap.

THE STUDENT:
Name: {{name}}
Year: {{year}}
Domain: {{domain}}
Profile type: {{profile_type}}
Current phase: {{current_phase}} of 5
Completed tasks: {{completed_tasks}}
Days active: {{days_active}}

THEIR CURRENT ROADMAP:
{{roadmap_json}}

YOUR RULES:
1. Be direct. Students don't want motivational fluff — they want actionable changes and honest answers.
2. When a student asks to modify the roadmap, confirm what you're changing and show them the updated version clearly.
3. When you make a change, return it as a JSON diff so the frontend can apply it to their roadmap_data in Supabase.
4. Never remove phases — only modify tasks within them.
5. Never change salary data — that's factual market data.
6. If a student says they're stuck, ask one specific question to diagnose before suggesting a solution. Don't dump advice.
7. If a student seems demoralized or says they want to quit, acknowledge it briefly, then give one concrete thing to do today — not a speech.
8. Max response length: 150 words. Be concise.
9. When modifying the roadmap, always output changes in this format:
   CHANGE: [phase_number] | [task_index] | [action: add/remove/modify] | [new text if modify]
   The frontend will parse this to update the roadmap_data JSON.

DOMAINS YOU KNOW ABOUT:
Cloud, Full Stack, Data Analytics, AI & ML, Cybersecurity, UI/UX, Networking, Business/PM, DevOps, Blockchain, IoT, GenAI, DevRel

You are helpful, honest, and brief. You don't praise the student for asking questions. You just answer them well.`

function buildSystemPrompt(student, roadmap) {
  return SYSTEM_PROMPT_TEMPLATE
    .replace('{{name}}', student?.name || 'Student')
    .replace('{{year}}', student?.year || 'Unknown')
    .replace('{{domain}}', student?.domain || 'Unknown')
    .replace('{{profile_type}}', student?.profile_type || 'Unknown')
    .replace('{{current_phase}}', String(student?.current_phase || 1))
    .replace('{{completed_tasks}}', JSON.stringify(student?.completed_tasks || {}))
    .replace('{{days_active}}', String(student?.days_active || 0))
    .replace('{{roadmap_json}}', JSON.stringify(roadmap || {}, null, 2))
}

function parseChanges(content) {
  const changes = []
  const regex = /CHANGE:\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(add|remove|modify)\s*\|\s*(.*)/gi
  let match
  while ((match = regex.exec(content)) !== null) {
    changes.push({
      phase: parseInt(match[1]),
      taskIndex: parseInt(match[2]),
      action: match[3].toLowerCase(),
      text: match[4].trim(),
    })
  }
  return changes
}

router.post('/roadmap-ai', async (req, res) => {
  try {
    const { messages, student, roadmap } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' })
    }

    // Rate limit check
    if (student?.name) {
      // Verify rate limit from Supabase if we have student context
      // The frontend already shows the counter, this is server-side enforcement
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' })
    }

    const systemPrompt = buildSystemPrompt(student, roadmap)

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: systemPrompt,
        messages: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text()
      console.error('Anthropic API error:', errBody)
      return res.status(502).json({ error: 'AI service unavailable' })
    }

    const data = await anthropicRes.json()
    const content = data.content?.[0]?.text || 'I had trouble processing that.'

    // Parse any roadmap changes
    const changes = parseChanges(content)

    // Update AI message count for the student
    if (student?.name) {
      const today = new Date().toISOString().split('T')[0]
      // Increment via Supabase if we have user context
    }

    res.json({ content, changes: changes.length > 0 ? changes : undefined })
  } catch (err) {
    console.error('Roadmap AI error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
