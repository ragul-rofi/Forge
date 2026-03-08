import { useState } from 'react'
import { supabase } from '../lib/supabase'
import OptionScoreEditor from './OptionScoreEditor'

const SIGNAL_TYPES = ['interest', 'aptitude', 'mindset', 'priority', 'motivation', 'validation']
const QUESTION_TYPES = ['gateway', 'general', 'advanced', 'validate', 'tiebreaker']

export default function QuestionEditor({ question, onSave, onClose }) {
  const [form, setForm] = useState({ ...question })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  if (!question) return null

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const updateOption = (optIdx, key, val) => {
    setForm((f) => {
      const options = [...(f.options || [])]
      options[optIdx] = { ...options[optIdx], [key]: val }
      return { ...f, options }
    })
  }

  const updateOptionScore = (optIdx, profile, val) => {
    setForm((f) => {
      const options = [...(f.options || [])]
      const scores = { ...options[optIdx].scores }
      scores[profile] = val
      options[optIdx] = { ...options[optIdx], scores }
      return { ...f, options }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save question
      const { error: qError } = await supabase
        .from('questions')
        .update({
          question_text: form.question_text,
          signal_type: form.signal_type,
          question_type: form.question_type,
          display_order: form.display_order,
          is_active: form.is_active,
        })
        .eq('id', form.id)

      if (qError) throw qError

      // Save options
      for (const opt of form.options || []) {
        const { error: oError } = await supabase
          .from('question_options')
          .update({
            option_text: opt.option_text,
            scores: opt.scores,
          })
          .eq('id', opt.id)

        if (oError) throw oError
      }

      // Log admin event
      await supabase.from('admin_events').insert({
        event_type: 'question_edited',
        event_data: { question_id: form.id, changes: form },
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSave?.(form)
    } catch (err) {
      console.error('Save failed:', err)
      alert('Save failed. Check console for details.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-[700]" style={{ color: 'var(--text)' }}>
          Question #{form.display_order || form.id}
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary text-xs">
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          {onClose && (
            <button onClick={onClose} className="text-sm" style={{ color: 'var(--muted)' }}>✕</button>
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="text-xs px-3 py-2 rounded" style={{ backgroundColor: '#fbbf2410', color: '#fbbf24' }}>
        ⚠ Editing live questions affects all future quiz sessions. Existing sessions are not affected.
      </div>

      {showPreview ? (
        /* Preview mode */
        <div
          className="card p-6"
          style={{ maxWidth: 480, margin: '0 auto' }}
        >
          <p className="text-sm font-mono mb-1" style={{ color: 'var(--muted)' }}>
            {form.signal_type?.toUpperCase()}
          </p>
          <h3 className="text-lg font-[700] mb-6" style={{ color: 'var(--text)' }}>
            {form.question_text}
          </h3>
          <div className="space-y-3">
            {(form.options || []).map((opt, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                {opt.option_text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Edit mode */
        <>
          {/* Question text */}
          <div>
            <label className="font-mono text-xs tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
              QUESTION TEXT
            </label>
            <textarea
              value={form.question_text || ''}
              onChange={(e) => update('question_text', e.target.value)}
              className="input w-full text-sm"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="font-mono text-xs tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
                SIGNAL TYPE
              </label>
              <select
                value={form.signal_type || ''}
                onChange={(e) => update('signal_type', e.target.value)}
                className="input w-full text-sm"
              >
                {SIGNAL_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
                QUESTION TYPE
              </label>
              <select
                value={form.question_type || ''}
                onChange={(e) => update('question_type', e.target.value)}
                className="input w-full text-sm"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
                ORDER
              </label>
              <input
                type="number"
                value={form.display_order || 0}
                onChange={(e) => update('display_order', parseInt(e.target.value) || 0)}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="font-mono text-xs tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
                ACTIVE
              </label>
              <button
                onClick={() => update('is_active', !form.is_active)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  form.is_active ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    form.is_active ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Options */}
          <div>
            <h4 className="font-mono text-xs tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
              OPTIONS
            </h4>
            <div className="space-y-4">
              {(form.options || []).map((opt, i) => (
                <div key={i} className="card p-4">
                  <label className="font-mono text-xs mb-1 block" style={{ color: 'var(--muted)' }}>
                    OPTION {String.fromCharCode(65 + i)}
                  </label>
                  <textarea
                    value={opt.option_text || ''}
                    onChange={(e) => updateOption(i, 'option_text', e.target.value)}
                    className="input w-full text-sm mb-3"
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                  <OptionScoreEditor
                    scores={opt.scores || {}}
                    onChange={(profile, val) => updateOptionScore(i, profile, val)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
