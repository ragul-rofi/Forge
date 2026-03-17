import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../../lib/constants'
import { DOMAIN_ROADMAPS } from '../../data/roadmaps'
import useStudentProgress from '../../hooks/useStudentProgress'
import LoadingDots from '../../components/ui/LoadingDots'
import DashboardNav from '../../components/dashboard/DashboardNav'
import ProfileBadge from '../../components/dashboard/ProfileBadge'
import RoadmapView from '../../components/dashboard/RoadmapView'
import CertTracker from '../../components/dashboard/CertTracker'
import AIPersonalizer from '../../components/dashboard/AIPersonalizer'
import OnboardingTour from '../../components/dashboard/OnboardingTour'
import SriniFloat from '../../components/dashboard/SriniFloat'
import SriniCard from '../../components/voice/SriniCard'
import { Flame } from 'lucide-react'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('roadmap')
  const [showSrini, setShowSrini] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    document.title = 'FORGE — My Roadmap'
  }, [])

  useEffect(() => {
    if (location.pathname === '/dashboard/explore') setActiveTab('explore')
    else if (location.pathname === '/dashboard/progress') setActiveTab('progress')
    else setActiveTab('roadmap')
  }, [location.pathname])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
      } else {
        navigate('/login')
      }
      setAuthLoading(false)
    })
  }, [navigate])

  const {
    student,
    loading,
    toggleTask,
    completePhase,
    isPhaseComplete,
    getCurrentPhase,
    getCompletedPhasesCount,
    updateRoadmapData,
    updateCertStatus,
  } = useStudentProgress(user?.id)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleOnboardingComplete = async () => {
    if (user) {
      await supabase
        .from('students')
        .update({ onboarding_complete: true })
        .eq('id', user.id)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <LoadingDots />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)' }}>You haven't taken the quiz yet.</p>
        <Link to="/quiz" className="btn-primary no-underline">Take the Quiz →</Link>
      </div>
    )
  }

  const domain = student.domain
  const domainColor = DOMAIN_COLORS[domain] || '#888'
  const roadmap = student.roadmap_data
    ? { ...DOMAIN_ROADMAPS[domain], ...student.roadmap_data }
    : DOMAIN_ROADMAPS[domain]
  const currentPhase = getCurrentPhase()
  const completedPhases = getCompletedPhasesCount()
  const daysSinceStart = student.created_at
    ? Math.floor((Date.now() - new Date(student.created_at).getTime()) / 86400000)
    : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Show onboarding tour on first visit */}
      {student && !student.onboarding_complete && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}

      <DashboardNav
        onLogout={handleLogout}
        onSriniOpen={() => setShowSrini((prev) => !prev)}
      />

      <div className="max-w-2xl mx-auto px-4 pb-16 pt-6">
        <ProfileBadge
          student={student}
          domainColor={domainColor}
          completedPhases={completedPhases}
          daysSinceStart={daysSinceStart}
        />

        {/* Tab Content */}
        {activeTab === 'roadmap' && roadmap && (
          <>
            <RoadmapView
              roadmap={roadmap}
              domainColor={domainColor}
              student={student}
              currentPhase={currentPhase}
              isPhaseComplete={isPhaseComplete}
              toggleTask={toggleTask}
              completePhase={completePhase}
            />
            <section id="cert-section" className="mb-8">
              <CertTracker
                certifications={roadmap.certifications || []}
                domainColor={domainColor}
                certProgress={student.phase_progress?.certifications || {}}
                onUpdateStatus={updateCertStatus}
              />
            </section>
            <section id="ai-section" className="mb-8">
              <AIPersonalizer
                student={{ ...student, currentPhase }}
                roadmap={roadmap}
                onRoadmapChange={updateRoadmapData}
              />
            </section>
          </>
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            student={student}
            completedPhases={completedPhases}
            currentPhase={currentPhase}
            domainColor={domainColor}
            daysSinceStart={daysSinceStart}
          />
        )}

        {activeTab === 'explore' && <ExploreTab currentDomain={domain} />}

        {showSrini && (
          <section className="mb-8">
            <SriniCard
              student={{ name: student.name, email: student.email, year: student.year_of_study, timeAvailable: student.time_available, priority: student.priority }}
              domain={domain}
              profile={student.profile_type}
            />
          </section>
        )}
      </div>

      <SriniFloat onClick={() => setShowSrini((prev) => !prev)} />
    </div>
  )
}

function ProgressTab({ student, completedPhases, currentPhase, domainColor, daysSinceStart }) {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h4 className="section-label mb-4">Your Progress</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Phases Completed</p>
            <p className="text-2xl font-bold" style={{ color: domainColor }}>{completedPhases}/5</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Current Phase</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{currentPhase}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Days Active</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{daysSinceStart}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Streak</p>
            <p className="text-2xl font-bold inline-flex items-center gap-1" style={{ color: '#f97316' }}>
              <Flame size={18} />
              {student.streak_days || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h4 className="section-label mb-4">Tasks Completed</h4>
        {[1, 2, 3, 4, 5].map(n => {
          const tasks = student.phase_progress?.[`phase_${n}`] || []
          const complete = student.phase_progress?.[`phase_${n}_complete`]
          return (
            <div key={n} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text)' }}>Phase {n}</span>
              <span className="text-xs font-medium" style={{ color: complete ? '#10b981' : 'var(--muted)' }}>
                {complete ? '✓ Complete' : `${tasks.length} tasks checked`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ExploreTab({ currentDomain }) {
  const domains = Object.entries(DOMAIN_ROADMAPS)

  return (
    <div className="space-y-3">
      <h3 className="section-label mb-4">All 13 Domains</h3>
      {domains.map(([key, r]) => (
        <div
          key={key}
          className="card p-4"
          style={{
            borderLeft: key === currentDomain ? `3px solid ${DOMAIN_COLORS[key]}` : undefined,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[key] }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {DOMAIN_NAMES[key]}
              </span>
              {key === currentDomain && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${DOMAIN_COLORS[key]}20`, color: DOMAIN_COLORS[key] }}>
                  YOUR DOMAIN
                </span>
              )}
            </div>
          </div>
          {r.salary && (
            <div className="flex gap-4 text-xs" style={{ color: 'var(--muted)' }}>
              <span>Entry: {r.salary.entry}</span>
              <span>2-3yr: {r.salary.mid}</span>
              <span>{r.salary.timeToJobReady}</span>
              {r.salary.aiRisk && (
                <span>AI Risk: {r.salary.aiRisk}</span>
              )}
            </div>
          )}
          {r.tagline && (
            <p className="text-xs mt-1 italic" style={{ color: 'var(--muted)' }}>{r.tagline}</p>
          )}
        </div>
      ))}
    </div>
  )
}
