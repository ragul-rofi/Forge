import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StudentTable from '../components/StudentTable'

export default function Students() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (err) {
      console.error('Fetch sessions error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (data) => {
    if (!data || data.length === 0) return

    const headers = [
      'id', 'student_name', 'student_email', 'year_of_study', 'department',
      'recommended_domain', 'second_domain', 'primary_profile', 'secondary_profile',
      'quiz_mode', 'time_available', 'priority', 'completion_rate',
      'score_breakdown', 'answers', 'validate_target', 'validate_verdict',
      'email_sent', 'created_at',
    ]

    const rows = data.map((row) =>
      headers.map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
        const str = String(val)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `forge-students-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (ids) => {
    if (!ids || ids.length === 0) return
    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .delete()
        .in('id', ids)

      if (error) throw error
      setSessions((prev) => prev.filter((s) => !ids.includes(s.id)))
    } catch (err) {
      console.error('Delete sessions error:', err)
      alert('Failed to delete session(s).')
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--muted)' }}>Loading students...</p>
  }

  return (
    <div>
      <h2 className="text-2xl font-[700] mb-6 inline-flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <Users size={22} strokeWidth={1.75} style={{ color: 'var(--muted2)' }} />
        Students
      </h2>
      <StudentTable sessions={sessions} onExport={handleExport} onDelete={handleDelete} />
    </div>
  )
}
