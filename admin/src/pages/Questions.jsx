import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import {
  Plus, Search, Filter, Download, Upload, FileDown, ArrowUpDown,
  ChevronDown, ChevronUp, Eye, EyeOff, Trash2, Copy, AlertTriangle,
  Check, X, FileText, RefreshCw, ArrowDownToLine, Replace, FilePlus2
} from 'lucide-react'
import QuestionEditor from '../components/QuestionEditor'

const MODE_GROUPS = [
  { label: 'All', type: null },
  { label: 'Gateway', type: 'gateway' },
  { label: 'General', type: 'general' },
  { label: 'Advanced', type: 'advanced' },
  { label: 'Validate', type: 'validate' },
  { label: 'Tiebreaker', type: 'tiebreaker' },
]

const SIGNAL_TYPES = ['interest', 'aptitude', 'mindset', 'priority', 'motivation', 'validation']

export default function Questions() {
  const [questions, setQuestions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(null)
  const [signalFilter, setSignalFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('') // '', 'active', 'inactive'
  const [showEditor, setShowEditor] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importMode, setImportMode] = useState('append') // 'append' | 'replace'
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [backupDownloaded, setBackupDownloaded] = useState(false)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [sortKey, setSortKey] = useState('display_order')
  const [sortDir, setSortDir] = useState('asc')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    setLoading(true)
    try {
      const { data: qs, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .order('display_order', { ascending: true })

      if (qErr) throw qErr

      const { data: opts, error: oErr } = await supabase
        .from('question_options')
        .select('*')
        .order('display_order', { ascending: true })

      if (oErr) throw oErr

      const questionsWithOptions = (qs || []).map((q) => ({
        ...q,
        options: (opts || []).filter((o) => o.question_id === q.id),
      }))

      setQuestions(questionsWithOptions)
    } catch (err) {
      console.error('Fetch questions error:', err)
      const { GATEWAY_QUESTIONS, GENERAL_QUESTIONS, ADVANCED_QUESTIONS, VALIDATE_QUESTIONS } = await import('../data/questions.js')
      const all = [
        ...GATEWAY_QUESTIONS.map((q, i) => ({ ...q, id: `gw-${i}`, question_type: 'gateway', display_order: i + 1 })),
        ...GENERAL_QUESTIONS.map((q, i) => ({ ...q, id: `gen-${i}`, question_type: 'general', display_order: i + 1 })),
        ...ADVANCED_QUESTIONS.map((q, i) => ({ ...q, id: `adv-${i}`, question_type: 'advanced', display_order: i + 1 })),
        ...VALIDATE_QUESTIONS.map((q, i) => ({ ...q, id: `val-${i}`, question_type: 'validate', display_order: i + 1 })),
      ]
      setQuestions(all)
    } finally {
      setLoading(false)
    }
  }

  // --- Filtering & Sorting ---
  const filtered = useMemo(() => {
    let result = [...questions]

    if (typeFilter) {
      result = result.filter((q) => q.question_type === typeFilter)
    }
    if (signalFilter) {
      result = result.filter((q) => q.signal_type === signalFilter)
    }
    if (activeFilter === 'active') {
      result = result.filter((q) => q.is_active !== false)
    } else if (activeFilter === 'inactive') {
      result = result.filter((q) => q.is_active === false)
    }
    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter((q) =>
        (q.question_text || '').toLowerCase().includes(s) ||
        (q.question_type || '').toLowerCase().includes(s) ||
        (q.signal_type || '').toLowerCase().includes(s)
      )
    }

    result.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [questions, typeFilter, signalFilter, activeFilter, search, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // --- Stats ---
  const stats = useMemo(() => {
    const byType = {}
    questions.forEach((q) => {
      const t = q.question_type || 'unknown'
      byType[t] = (byType[t] || 0) + 1
    })
    return {
      total: questions.length,
      active: questions.filter((q) => q.is_active !== false).length,
      byType,
    }
  }, [questions])

  // --- Add Question ---
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
      setShowEditor(true)
    } catch (err) {
      console.error('Add question error:', err)
      alert('Failed to add question.')
    }
  }

  // --- Delete Question ---
  const deleteQuestion = async (id) => {
    try {
      await supabase.from('question_options').delete().eq('question_id', id)
      await supabase.from('questions').delete().eq('id', id)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setShowEditor(false)
      }
      setDeleteTarget(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete question.')
    }
  }

  // --- Toggle Active ---
  const toggleActive = async (q) => {
    const newVal = !q.is_active
    try {
      await supabase.from('questions').update({ is_active: newVal }).eq('id', q.id)
      setQuestions((prev) =>
        prev.map((x) => (x.id === q.id ? { ...x, is_active: newVal } : x))
      )
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  // --- Duplicate Question ---
  const duplicateQuestion = async (q) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          question_text: `${q.question_text} (copy)`,
          question_type: q.question_type,
          signal_type: q.signal_type,
          display_order: questions.length + 1,
          is_active: false,
        })
        .select()
        .single()

      if (error) throw error

      const optionsToInsert = (q.options || []).map((opt, i) => ({
        question_id: data.id,
        option_text: opt.option_text,
        display_order: i + 1,
        scores: { ...opt.scores },
      }))

      const { data: opts } = await supabase
        .from('question_options')
        .insert(optionsToInsert)
        .select()

      setQuestions((prev) => [...prev, { ...data, options: opts || [] }])
    } catch (err) {
      console.error('Duplicate error:', err)
      alert('Failed to duplicate question.')
    }
  }

  // --- CSV Export ---
  const exportCSV = () => {
    const rows = []
    const headers = [
      'question_id', 'question_text', 'question_type', 'signal_type',
      'display_order', 'is_active',
      'option_a_text', 'option_a_maker', 'option_a_thinker', 'option_a_protector',
      'option_a_creator', 'option_a_leader', 'option_a_helper', 'option_a_explorer',
      'option_b_text', 'option_b_maker', 'option_b_thinker', 'option_b_protector',
      'option_b_creator', 'option_b_leader', 'option_b_helper', 'option_b_explorer',
      'option_c_text', 'option_c_maker', 'option_c_thinker', 'option_c_protector',
      'option_c_creator', 'option_c_leader', 'option_c_helper', 'option_c_explorer',
      'option_d_text', 'option_d_maker', 'option_d_thinker', 'option_d_protector',
      'option_d_creator', 'option_d_leader', 'option_d_helper', 'option_d_explorer',
    ]

    const dataToExport = typeFilter ? filtered : questions

    dataToExport.forEach((q) => {
      const row = {
        question_id: q.id,
        question_text: q.question_text || '',
        question_type: q.question_type || '',
        signal_type: q.signal_type || '',
        display_order: q.display_order || 0,
        is_active: q.is_active !== false ? 'true' : 'false',
      }

      const labels = ['a', 'b', 'c', 'd']
      labels.forEach((lbl, i) => {
        const opt = (q.options || [])[i]
        row[`option_${lbl}_text`] = opt?.option_text || ''
        const profiles = ['maker', 'thinker', 'protector', 'creator', 'leader', 'helper', 'explorer']
        profiles.forEach((p) => {
          row[`option_${lbl}_${p}`] = opt?.scores?.[p] ?? 0
        })
      })

      rows.push(row)
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => {
          const val = String(r[h] ?? '')
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`
          }
          return val
        }).join(',')
      ),
    ].join('\n')

    downloadFile(csvContent, `forge-questions-${typeFilter || 'all'}-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv')
  }

  // --- CSV Template Download ---
  const downloadTemplate = () => {
    const headers = [
      'question_text', 'question_type', 'signal_type', 'display_order', 'is_active',
      'option_a_text', 'option_a_maker', 'option_a_thinker', 'option_a_protector',
      'option_a_creator', 'option_a_leader', 'option_a_helper', 'option_a_explorer',
      'option_b_text', 'option_b_maker', 'option_b_thinker', 'option_b_protector',
      'option_b_creator', 'option_b_leader', 'option_b_helper', 'option_b_explorer',
      'option_c_text', 'option_c_maker', 'option_c_thinker', 'option_c_protector',
      'option_c_creator', 'option_c_leader', 'option_c_helper', 'option_c_explorer',
      'option_d_text', 'option_d_maker', 'option_d_thinker', 'option_d_protector',
      'option_d_creator', 'option_d_leader', 'option_d_helper', 'option_d_explorer',
    ]

    const exampleRow = [
      'What excites you most about technology?', 'general', 'interest', '1', 'true',
      'Building things that work', '2', '0', '0', '0', '0', '0', '0',
      'Analyzing patterns in data', '0', '2', '0', '0', '0', '0', '1',
      'Keeping systems secure', '0', '0', '2', '0', '0', '0', '0',
      'Making beautiful interfaces', '0', '0', '0', '2', '0', '0', '0',
    ]

    const csv = [headers.join(','), exampleRow.join(',')].join('\n')
    downloadFile(csv, 'forge-questions-template.csv', 'text/csv')
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  // --- Backup Export (forced before replace) ---
  const exportBackup = () => {
    exportCSV()
    setBackupDownloaded(true)
  }

  // --- CSV Import Parse ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportError('')
    setImportPreview(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target.result
        const parsed = parseCSV(text)
        if (parsed.length === 0) {
          setImportError('CSV file is empty or has no data rows.')
          return
        }
        setImportPreview(parsed)
      } catch (err) {
        setImportError(`Failed to parse CSV: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  function parseCSV(text) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) return []

    const headers = parseCSVLine(lines[0])
    const rows = []

    for (let i = 1; i < lines.length; i++) {
      const vals = parseCSVLine(lines[i])
      const obj = {}
      headers.forEach((h, j) => {
        obj[h.trim()] = (vals[j] || '').trim()
      })
      rows.push(obj)
    }

    // Validate required fields
    const requiredFields = ['question_text', 'question_type']
    const missingFields = requiredFields.filter((f) => !headers.map((h) => h.trim()).includes(f))
    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(', ')}`)
    }

    return rows
  }

  function parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"'
          i++
        } else if (ch === '"') {
          inQuotes = false
        } else {
          current += ch
        }
      } else {
        if (ch === '"') {
          inQuotes = true
        } else if (ch === ',') {
          result.push(current)
          current = ''
        } else {
          current += ch
        }
      }
    }
    result.push(current)
    return result
  }

  // --- CSV Import Execute ---
  const executeImport = async () => {
    if (!importPreview || importPreview.length === 0) return
    if (importMode === 'replace' && !backupDownloaded) {
      setImportError('You must download a backup before replacing all questions.')
      return
    }

    setImporting(true)
    setImportError('')

    try {
      if (importMode === 'replace') {
        // Delete all existing options and questions
        await supabase.from('question_options').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      }

      const profiles = ['maker', 'thinker', 'protector', 'creator', 'leader', 'helper', 'explorer']
      const labels = ['a', 'b', 'c', 'd']
      let startOrder = importMode === 'replace' ? 1 : questions.length + 1

      for (let i = 0; i < importPreview.length; i++) {
        const row = importPreview[i]

        const { data: q, error: qErr } = await supabase
          .from('questions')
          .insert({
            question_text: row.question_text || 'Untitled',
            question_type: row.question_type || 'general',
            signal_type: row.signal_type || 'interest',
            display_order: row.display_order ? parseInt(row.display_order) : startOrder + i,
            is_active: row.is_active === 'false' ? false : true,
          })
          .select()
          .single()

        if (qErr) throw qErr

        // Build options from CSV columns
        const optionsToInsert = []
        labels.forEach((lbl, j) => {
          const text = row[`option_${lbl}_text`]
          if (!text) return

          const scores = {}
          profiles.forEach((p) => {
            scores[p] = parseInt(row[`option_${lbl}_${p}`]) || 0
          })

          optionsToInsert.push({
            question_id: q.id,
            option_text: text,
            display_order: j + 1,
            scores,
          })
        })

        if (optionsToInsert.length > 0) {
          const { error: oErr } = await supabase
            .from('question_options')
            .insert(optionsToInsert)

          if (oErr) throw oErr
        }
      }

      // Log admin event
      await supabase.from('admin_events').insert({
        event_type: 'questions_imported',
        event_data: { mode: importMode, count: importPreview.length },
      })

      // Refresh
      await fetchQuestions()
      setShowImportModal(false)
      setImportFile(null)
      setImportPreview(null)
      setBackupDownloaded(false)
      setImportMode('append')
    } catch (err) {
      console.error('Import error:', err)
      setImportError(`Import failed: ${err.message}`)
    } finally {
      setImporting(false)
    }
  }

  // --- Save handler ---
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-[700]" style={{ color: 'var(--text)' }}>Questions</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            {stats.total} total · {stats.active} active
            {Object.entries(stats.byType).map(([t, c]) => (
              <span key={t} className="ml-2">{t}: {c}</span>
            ))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addQuestion} className="btn-primary text-sm inline-flex items-center gap-1.5">
            <Plus size={15} /> Add Question
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-sm w-full pl-9"
            />
          </div>

          {/* Type filter chips */}
          <div className="flex gap-1">
            {MODE_GROUPS.map((g) => (
              <button
                key={g.label}
                onClick={() => setTypeFilter(g.type)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === g.type ? 'bg-white/15' : 'hover:bg-white/5'
                }`}
                style={{
                  color: typeFilter === g.type ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {g.label}
                {g.type && stats.byType[g.type] ? ` (${stats.byType[g.type]})` : g.type === null ? ` (${stats.total})` : ''}
              </button>
            ))}
          </div>

          {/* Signal filter */}
          <select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value)}
            className="input text-xs"
          >
            <option value="">All Signals</option>
            {SIGNAL_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Active filter */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="input text-xs"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* CSV Actions */}
          <div className="flex items-center gap-1 border-l pl-3" style={{ borderColor: 'var(--border)' }}>
            <button onClick={exportCSV} className="btn-secondary text-xs inline-flex items-center gap-1">
              <Download size={13} /> Export
            </button>
            <button onClick={() => { setShowImportModal(true); setBackupDownloaded(false) }} className="btn-secondary text-xs inline-flex items-center gap-1">
              <Upload size={13} /> Import
            </button>
            <button onClick={downloadTemplate} className="btn-secondary text-xs inline-flex items-center gap-1" title="Download CSV template">
              <FileDown size={13} /> Template
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panel (slide-over) */}
      {showEditor && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditor(false)} />
          <div
            className="relative w-full max-w-2xl overflow-y-auto p-6"
            style={{ backgroundColor: 'var(--bg)' }}
          >
            <QuestionEditor
              key={selectedQuestion.id}
              question={selectedQuestion}
              onSave={(updated) => {
                handleSave(updated)
              }}
              onClose={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Questions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: 'var(--text)' }}>
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th
                  className="p-3 text-left font-mono text-xs tracking-wider cursor-pointer whitespace-nowrap"
                  style={{ color: 'var(--muted)' }}
                  onClick={() => toggleSort('display_order')}
                >
                  # {sortKey === 'display_order' && (sortDir === 'asc' ? <ChevronUp size={12} className="inline" /> : <ChevronDown size={12} className="inline" />)}
                </th>
                <th
                  className="p-3 text-left font-mono text-xs tracking-wider cursor-pointer"
                  style={{ color: 'var(--muted)' }}
                  onClick={() => toggleSort('question_text')}
                >
                  Question {sortKey === 'question_text' && (sortDir === 'asc' ? <ChevronUp size={12} className="inline" /> : <ChevronDown size={12} className="inline" />)}
                </th>
                <th
                  className="p-3 text-left font-mono text-xs tracking-wider cursor-pointer whitespace-nowrap"
                  style={{ color: 'var(--muted)' }}
                  onClick={() => toggleSort('question_type')}
                >
                  Type {sortKey === 'question_type' && (sortDir === 'asc' ? <ChevronUp size={12} className="inline" /> : <ChevronDown size={12} className="inline" />)}
                </th>
                <th
                  className="p-3 text-left font-mono text-xs tracking-wider cursor-pointer whitespace-nowrap"
                  style={{ color: 'var(--muted)' }}
                  onClick={() => toggleSort('signal_type')}
                >
                  Signal {sortKey === 'signal_type' && (sortDir === 'asc' ? <ChevronUp size={12} className="inline" /> : <ChevronDown size={12} className="inline" />)}
                </th>
                <th className="p-3 text-left font-mono text-xs tracking-wider whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                  Options
                </th>
                <th className="p-3 text-left font-mono text-xs tracking-wider whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                  Status
                </th>
                <th className="p-3 text-right font-mono text-xs tracking-wider whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  expanded={expandedRows.has(q.id)}
                  onToggle={() => toggleRow(q.id)}
                  onEdit={() => { setSelectedId(q.id); setShowEditor(true) }}
                  onDelete={() => setDeleteTarget(q)}
                  onToggleActive={() => toggleActive(q)}
                  onDuplicate={() => duplicateQuestion(q)}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center" style={{ color: 'var(--muted)' }}>
                    No questions match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          Showing {filtered.length} of {questions.length} questions
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => { setShowImportModal(false); setImportFile(null); setImportPreview(null); setImportError(''); setBackupDownloaded(false) }}
          importMode={importMode}
          setImportMode={setImportMode}
          importFile={importFile}
          importPreview={importPreview}
          importError={importError}
          importing={importing}
          backupDownloaded={backupDownloaded}
          onFileChange={handleFileChange}
          onExportBackup={exportBackup}
          onDownloadTemplate={downloadTemplate}
          onExecute={executeImport}
          fileInputRef={fileInputRef}
          totalQuestions={questions.length}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm mx-4 card p-6" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f43f5e15' }}>
                <Trash2 size={18} style={{ color: '#f43f5e' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Delete Question</h3>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--muted2)' }}>
              Are you sure you want to delete this question and all its options?
            </p>
            <div className="text-sm p-3 rounded-lg mt-3 mb-5" style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}>
              <span className="text-xs font-mono mr-2" style={{ color: 'var(--muted)' }}>#{deleteTarget.display_order}</span>
              {deleteTarget.question_text?.slice(0, 100)}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-1.5 rounded-lg text-sm cursor-pointer"
                style={{ color: 'var(--muted)', background: 'none', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteQuestion(deleteTarget.id)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer"
                style={{ backgroundColor: '#f43f5e', color: '#fff', border: 'none' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Question Row Component ---
function QuestionRow({ question: q, expanded, onToggle, onEdit, onDelete, onToggleActive, onDuplicate }) {
  const typeColors = {
    gateway: '#f97316',
    general: '#38bdf8',
    advanced: '#a78bfa',
    validate: '#10b981',
    tiebreaker: '#fbbf24',
  }

  return (
    <>
      <tr
        className="border-b cursor-pointer transition-colors hover:bg-white/[0.03]"
        style={{ borderColor: 'var(--border)', opacity: q.is_active === false ? 0.5 : 1 }}
        onClick={onToggle}
      >
        <td className="p-3 font-mono text-xs" style={{ color: 'var(--muted)' }}>
          {q.display_order}
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
            <span className="line-clamp-1">{q.question_text}</span>
          </div>
        </td>
        <td className="p-3">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${typeColors[q.question_type] || '#888'}20`, color: typeColors[q.question_type] || '#888' }}
          >
            {q.question_type}
          </span>
        </td>
        <td className="p-3 text-xs capitalize" style={{ color: 'var(--muted2)' }}>
          {q.signal_type || '—'}
        </td>
        <td className="p-3 text-xs" style={{ color: 'var(--muted)' }}>
          {(q.options || []).length}
        </td>
        <td className="p-3">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive() }}
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: q.is_active !== false ? '#10b981' : 'var(--muted)' }}
          >
            {q.is_active !== false ? <Eye size={13} /> : <EyeOff size={13} />}
            {q.is_active !== false ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="p-3 text-right">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={onEdit} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Edit" style={{ color: 'var(--muted2)' }}>
              <FileText size={14} />
            </button>
            <button onClick={onDuplicate} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Duplicate" style={{ color: 'var(--muted2)' }}>
              <Copy size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Delete" style={{ color: '#f43f5e' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="p-0">
            <div className="px-6 py-4 space-y-2" style={{ backgroundColor: 'var(--surface)' }}>
              {(q.options || []).map((opt, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="font-mono font-semibold w-5 shrink-0" style={{ color: 'var(--muted)' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1" style={{ color: 'var(--text)' }}>{opt.option_text}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {Object.entries(opt.scores || {}).filter(([, v]) => v !== 0).map(([profile, val]) => (
                      <span
                        key={profile}
                        className="font-mono px-1.5 py-0.5 rounded text-[10px]"
                        style={{
                          backgroundColor: val > 0 ? '#10b98120' : '#f43f5e20',
                          color: val > 0 ? '#10b981' : '#f43f5e',
                        }}
                      >
                        {profile.slice(0, 3)}{val > 0 ? '+' : ''}{val}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {(q.options || []).length === 0 && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>No options defined</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// --- Import Modal Component ---
function ImportModal({
  onClose, importMode, setImportMode, importFile, importPreview, importError,
  importing, backupDownloaded, onFileChange, onExportBackup, onDownloadTemplate,
  onExecute, fileInputRef, totalQuestions
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 card p-6 space-y-5" style={{ backgroundColor: 'var(--bg)' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-[700]" style={{ color: 'var(--text)' }}>Import Questions</h3>
          <button onClick={onClose} style={{ color: 'var(--muted)' }}><X size={18} /></button>
        </div>

        {/* Step 1: Mode selection */}
        <div>
          <label className="font-mono text-xs tracking-wider mb-2 block" style={{ color: 'var(--muted)' }}>
            IMPORT MODE
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setImportMode('append')}
              className={`flex-1 p-3 rounded-lg border text-sm text-left transition-colors ${importMode === 'append' ? 'border-[var(--accent)]' : ''}`}
              style={{ borderColor: importMode === 'append' ? 'var(--accent)' : 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <FilePlus2 size={16} style={{ color: importMode === 'append' ? 'var(--accent)' : 'var(--muted)' }} />
                <span className="font-semibold" style={{ color: 'var(--text)' }}>Append</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Add new questions alongside existing {totalQuestions} questions
              </p>
            </button>
            <button
              onClick={() => setImportMode('replace')}
              className={`flex-1 p-3 rounded-lg border text-sm text-left transition-colors ${importMode === 'replace' ? 'border-[#f43f5e]' : ''}`}
              style={{ borderColor: importMode === 'replace' ? '#f43f5e' : 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Replace size={16} style={{ color: importMode === 'replace' ? '#f43f5e' : 'var(--muted)' }} />
                <span className="font-semibold" style={{ color: 'var(--text)' }}>Replace All</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Delete all {totalQuestions} existing questions and replace with CSV
              </p>
            </button>
          </div>
        </div>

        {/* Step 2: Backup (required for replace) */}
        {importMode === 'replace' && (
          <div className="px-3 py-3 rounded-lg" style={{ backgroundColor: '#f43f5e10', border: '1px solid #f43f5e30' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: '#f43f5e' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: '#f43f5e' }}>
                  Backup Required
                </p>
                <p className="text-xs mb-3" style={{ color: 'var(--muted2)' }}>
                  Replacing deletes ALL current questions permanently. You must download a backup first.
                </p>
                <button
                  onClick={onExportBackup}
                  className={`text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    backupDownloaded ? 'bg-green-500/20' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  style={{ color: backupDownloaded ? '#10b981' : 'var(--text)' }}
                >
                  {backupDownloaded ? <><Check size={13} /> Backup Downloaded</> : <><ArrowDownToLine size={13} /> Download Backup Now</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: File upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-xs tracking-wider" style={{ color: 'var(--muted)' }}>
              CSV FILE
            </label>
            <button onClick={onDownloadTemplate} className="text-xs inline-flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              <FileDown size={12} /> Download Template
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-lg border-2 border-dashed text-center transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            {importFile ? (
              <span className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                <FileText size={16} /> {importFile.name}
              </span>
            ) : (
              <span className="text-sm">Click to select a CSV file</span>
            )}
          </button>
        </div>

        {/* Preview */}
        {importPreview && (
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Preview: {importPreview.length} questions found
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {importPreview.slice(0, 10).map((row, i) => (
                <div key={i} className="text-xs p-2 rounded" style={{ backgroundColor: 'var(--surface)' }}>
                  <span className="font-mono mr-2" style={{ color: 'var(--muted)' }}>#{i + 1}</span>
                  <span style={{ color: 'var(--text)' }}>{row.question_text?.slice(0, 80)}</span>
                  <span className="ml-2 opacity-60">({row.question_type})</span>
                </div>
              ))}
              {importPreview.length > 10 && (
                <p className="text-xs text-center py-1" style={{ color: 'var(--muted)' }}>
                  ...and {importPreview.length - 10} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {importError && (
          <p className="text-xs flex items-center gap-1" style={{ color: '#f43f5e' }}>
            <AlertTriangle size={13} /> {importError}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={onExecute}
            disabled={!importPreview || importing || (importMode === 'replace' && !backupDownloaded)}
            className="btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            {importing ? (
              <><RefreshCw size={14} className="animate-spin" /> Importing...</>
            ) : (
              <><Upload size={14} /> {importMode === 'replace' ? `Replace with ${importPreview?.length || 0} Questions` : `Append ${importPreview?.length || 0} Questions`}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
