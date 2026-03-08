import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import QuestionEditor from '../../components/admin/QuestionEditor'

const MODE_GROUPS = [
  { label: 'Gateway', type: 'gateway' },
  { label: 'General', type: 'general' },
  { label: 'Advanced', type: 'advanced' },
  { label: 'Validate', type: 'validate' },
]

export default function Questions() {
  const [questions, setQuestions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    try {
      const { data: qs, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .order('display_order', { ascending: true })

      if (qErr) throw qErr

      // Also fetch options for each question
      const { data: opts, error: oErr } = await supabase
        .from('question_options')
        .select('*')
        .order('display_order', { ascending: true })

      if (oErr) throw oErr

      // Merge options into questions
      const questionsWithOptions = (qs || []).map((q) => ({
        ...q,
        options: (opts || []).filter((o) => o.question_id === q.id),
      }))

      setQuestions(questionsWithOptions)
      if (questionsWithOptions.length > 0 && !selectedId) {
        setSelectedId(questionsWithOptions[0].id)
      }
    } catch (err) {
      console.error('Fetch questions error:', err)

      // Use seed data as fallback
      const { GATEWAY_QUESTIONS, GENERAL_QUESTIONS, ADVANCED_QUESTIONS, VALIDATE_QUESTIONS } = await import('../../data/questions.js')
      const all = [
        ...GATEWAY_QUESTIONS.map((q, i) => ({ ...q, id: `gw-${i}`, question_type: 'gateway', display_order: i + 1 })),
        ...GENERAL_QUESTIONS.map((q, i) => ({ ...q, id: `gen-${i}`, question_type: 'general', display_order: i + 1 })),
        ...ADVANCED_QUESTIONS.map((q, i) => ({ ...q, id: `adv-${i}`, question_type: 'advanced', display_order: i + 1 })),
        ...VALIDATE_QUESTIONS.map((q, i) => ({ ...q, id: `val-${i}`, question_type: 'validate', display_order: i + 1 })),
      ]
      setQuestions(all)
      if (all.length > 0) setSelectedId(all[0].id)
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          question_text: 'New question',
          question_type: 'general',
          signal_type: 'interest',
          display_order: questions.length + 1,
          is_active: false,
        })
        .select()
        .single()

      if (error) throw error

      // Create 4 blank options
      const optionsToInsert = Array.from({ length: 4 }, (_, i) => ({
        question_id: data.id,
        option_text: `Option ${String.fromCharCode(65 + i)}`,
        display_order: i + 1,
        scores: { maker: 0, thinker: 0, protector: 0, creator: 0, leader: 0, helper: 0, explorer: 0 },
      }))

      const { data: opts } = await supabase
        .from('question_options')
        .insert(optionsToInsert)
        .select()

      const newQ = { ...data, options: opts || [] }
      setQuestions((prev) => [...prev, newQ])
      setSelectedId(data.id)
    } catch (err) {
      console.error('Add question error:', err)
      alert('Failed to add question. Check console for details.')
    }
  }

  const handleSave = (updated) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q))
    )
  }

  const selectedQuestion = questions.find((q) => q.id === selectedId)

  if (loading) {
    return <p style={{ color: 'var(--muted)' }}>Loading questions...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-[700]" style={{ color: 'var(--text)' }}>Questions</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-secondary text-xs md:hidden"
          >
            {sidebarOpen ? 'Hide List' : 'Show List'}
          </button>
          <button onClick={addQuestion} className="btn-primary text-sm">
            + Add Question
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 shrink-0`}
        >
          <div className="card p-3 space-y-4 max-h-[70vh] overflow-y-auto sticky top-20">
            {MODE_GROUPS.map((group) => {
              const groupQuestions = questions.filter((q) => q.question_type === group.type)
              if (groupQuestions.length === 0) return null
              return (
                <div key={group.type}>
                  <h4
                    className="font-mono text-xs tracking-wider mb-2 px-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    {group.label.toUpperCase()} ({groupQuestions.length})
                  </h4>
                  <div className="space-y-0.5">
                    {groupQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => { setSelectedId(q.id); setSidebarOpen(false) }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors truncate ${
                          selectedId === q.id ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                        style={{
                          color: selectedId === q.id ? 'var(--text)' : 'var(--muted2)',
                          opacity: q.is_active === false ? 0.5 : 1,
                        }}
                      >
                        <span className="font-mono mr-1" style={{ color: 'var(--muted)' }}>
                          #{q.display_order}
                        </span>
                        {(q.question_text || '').slice(0, 50)}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          {selectedQuestion ? (
            <QuestionEditor
              key={selectedQuestion.id}
              question={selectedQuestion}
              onSave={handleSave}
            />
          ) : (
            <div className="card p-8 text-center" style={{ color: 'var(--muted)' }}>
              Select a question from the sidebar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
