import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'

const router = Router()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Update student progress (phase tasks, phase completion)
router.patch('/progress', async (req, res) => {
  try {
    const { studentId, phase_progress } = req.body

    if (!studentId || !phase_progress) {
      return res.status(400).json({ error: 'studentId and phase_progress required' })
    }

    const { error } = await supabase
      .from('students')
      .update({
        phase_progress,
        last_active: new Date().toISOString(),
      })
      .eq('id', studentId)

    if (error) throw error

    res.json({ success: true })
  } catch (err) {
    console.error('Progress update error:', err)
    res.status(500).json({ error: 'Failed to update progress' })
  }
})

// Get student dashboard data
router.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Student not found' })

    res.json(data)
  } catch (err) {
    console.error('Student fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch student' })
  }
})

export default router
