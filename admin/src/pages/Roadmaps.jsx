import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../hooks/useAdmin'
import RoadmapEditor from '../components/RoadmapEditor'
import RoadmapVersionHistory from '../components/RoadmapVersionHistory'
import { AlertTriangle, Check, Loader2 } from 'lucide-react'
import { DOMAIN_ROADMAPS } from '../data/roadmapDefaults'

const DOMAIN_COLORS = {
  cloud: '#38bdf8', fullstack: '#f97316', data: '#a78bfa', ai: '#f43f5e',
  cyber: '#10b981', design: '#fbbf24', networking: '#6366f1', business: '#34d399',
  devops: '#e879f9', blockchain: '#f59e0b', iot: '#22d3ee', genai: '#818cf8', devrel: '#4ade80',
}

const DOMAIN_NAMES = {
  cloud: 'Cloud Computing', fullstack: 'Full Stack Dev', data: 'Data Analytics',
  ai: 'AI & ML', cyber: 'Cybersecurity', design: 'UI/UX Design',
  networking: 'Networking', business: 'Business / PM', devops: 'DevOps / SRE',
  blockchain: 'Blockchain & Web3', iot: 'IoT & Embedded', genai: 'GenAI Engineering',
  devrel: 'DevRel & Content',
}

const ALL_DOMAINS = Object.keys(DOMAIN_NAMES)

export default function Roadmaps() {
  const { user } = useAdmin()
  const [templates, setTemplates] = useState({})
  const [selectedDomain, setSelectedDomain] = useState('cloud')
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [impactCounts, setImpactCounts] = useState({ affected: 0, customized: 0 })

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('roadmap_templates')
        .select('*')
        .eq('is_active', true)

      if (error) throw error

      const map = {}
      ;(data || []).forEach(t => { map[t.domain] = t })
      setTemplates(map)
    } catch (err) {
      console.error('Failed to fetch roadmap templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentTemplate = templates[selectedDomain]

  const handleChange = (updated) => {
    setTemplates(prev => ({
      ...prev,
      [selectedDomain]: { ...prev[selectedDomain], ...updated },
    }))
    setDirty(true)
  }

  const handlePublishClick = async () => {
    // Fetch impact counts
    try {
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('domain', selectedDomain)

      const { count: customStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('domain', selectedDomain)
        .eq('ai_customized', true)

      setImpactCounts({
        affected: (totalStudents || 0) - (customStudents || 0),
        customized: customStudents || 0,
      })
    } catch {
      // Counts may fail; proceed anyway
    }
    setShowConfirm(true)
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const template = templates[selectedDomain]
      const changeEntry = {
        timestamp: new Date().toISOString(),
        admin_email: user?.email || 'unknown',
        description: 'Roadmap updated',
      }

      const changeLog = [...(template.change_log || []), changeEntry]

      if (template.id) {
        // Update existing
        const { error } = await supabase
          .from('roadmap_templates')
          .update({
            phases: template.phases,
            certifications: template.certifications,
            salary_data: template.salary_data,
            updated_at: new Date().toISOString(),
            updated_by: user?.email,
            version: (template.version || 1) + 1,
            change_log: changeLog,
          })
          .eq('id', template.id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('roadmap_templates')
          .insert({
            domain: selectedDomain,
            phases: template.phases,
            certifications: template.certifications,
            salary_data: template.salary_data,
            updated_by: user?.email,
            change_log: changeLog,
          })

        if (error) throw error
      }

      setDirty(false)
      setShowConfirm(false)
      await fetchTemplates()
    } catch (err) {
      console.error('Publish error:', err)
      alert('Failed to publish. Check console for details.')
    } finally {
      setPublishing(false)
    }
  }

  const handleRestore = async (entry) => {
    // Restore is informational for now; actual snapshot restore would need stored phases
    console.log('Restore requested for:', entry)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--muted)' }} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Roadmap Templates</h1>
        {dirty && (
          <button
            onClick={handlePublishClick}
            className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer inline-flex items-center gap-2"
            style={{
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
            }}
          >
            <Check size={14} />
            Publish Changes
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Left: Domain List */}
        <div className="w-48 shrink-0 space-y-1">
          {ALL_DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => { setSelectedDomain(d); setDirty(false) }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-150 flex items-center gap-2 hover:scale-[1.03] hover:shadow-sm"
              style={{
                backgroundColor: selectedDomain === d ? 'var(--bg)' : 'transparent',
                color: selectedDomain === d ? 'var(--text)' : 'var(--muted)',
                border: selectedDomain === d ? `1px solid ${DOMAIN_COLORS[d]}30` : '1px solid transparent',
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: DOMAIN_COLORS[d] }}
              />
              {DOMAIN_NAMES[d]}
            </button>
          ))}
        </div>

        {/* Right: Editor */}
        <div className="flex-1 min-w-0">
          {currentTemplate ? (
            <>
              <RoadmapEditor
                domain={selectedDomain}
                template={currentTemplate}
                domainColor={DOMAIN_COLORS[selectedDomain]}
                onChange={handleChange}
              />
              <div className="mt-6">
                <RoadmapVersionHistory
                  changeLog={currentTemplate.change_log}
                  onRestore={handleRestore}
                />
              </div>
            </>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                No roadmap template exists for {DOMAIN_NAMES[selectedDomain]} yet.
              </p>
              <button
                onClick={() => {
                  const defaults = DOMAIN_ROADMAPS[selectedDomain]
                  const defaultPhases = defaults?.phases?.map((p, i) => ({
                    number: p.number || i + 1,
                    title: p.title || `Phase ${i + 1}`,
                    duration: p.duration || '3–4 weeks',
                    tasks: p.tasks || [''],
                    readyCheck: '',
                    quitWarning: '',
                  })) || Array.from({ length: 5 }, (_, i) => ({
                    number: i + 1,
                    title: `Phase ${i + 1}`,
                    duration: '3–4 weeks',
                    tasks: [''],
                    readyCheck: '',
                    quitWarning: '',
                  }))

                  const defaultCerts = defaults?.certifications?.map(c => ({
                    name: c.name || '',
                    priority: c.priority || 1,
                    link: c.link || '',
                  })) || []

                  const defaultSalary = defaults?.salary ? {
                    entry: defaults.salary.entry || '',
                    mid: defaults.salary.mid || '',
                    timeToJobReady: defaults.salary.timeToJobReady || '',
                  } : { entry: '', mid: '', timeToJobReady: '' }

                  setTemplates(prev => ({
                    ...prev,
                    [selectedDomain]: {
                      domain: selectedDomain,
                      phases: defaultPhases,
                      certifications: defaultCerts,
                      salary_data: defaultSalary,
                      change_log: [],
                    },
                  }))
                  setDirty(true)
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: DOMAIN_COLORS[selectedDomain],
                  color: '#fff',
                  border: 'none',
                }}
              >
                Create Template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="card p-6 max-w-sm mx-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
              <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                Publish Changes?
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--muted2)' }}>
              This will update the default roadmap for{' '}
              <strong style={{ color: 'var(--text)' }}>{impactCounts.affected}</strong> students
              who have not AI-customized their plan.{' '}
              <strong style={{ color: 'var(--text)' }}>{impactCounts.customized}</strong> students
              with AI-customized roadmaps will not be affected.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1.5 rounded-lg text-sm cursor-pointer"
                style={{ color: 'var(--muted)', background: 'none', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer"
                style={{
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  opacity: publishing ? 0.6 : 1,
                }}
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
