import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useStudentProgress(studentId) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudent = useCallback(async () => {
    if (!studentId) return
    try {
      const { data, error: fetchErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (fetchErr) throw fetchErr
      setStudent(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])

  // Update streak on dashboard visit
  useEffect(() => {
    if (!student) return
    const today = new Date().toISOString().split('T')[0]
    if (student.last_active_date === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const newStreak = student.last_active_date === yesterdayStr
      ? (student.streak_days || 0) + 1
      : 1

    supabase
      .from('students')
      .update({ last_active_date: today, last_active: new Date().toISOString(), streak_days: newStreak })
      .eq('id', studentId)
      .then(() => {
        setStudent(prev => ({ ...prev, last_active_date: today, streak_days: newStreak }))
      })
  }, [student?.last_active_date, studentId])

  const toggleTask = async (phaseNumber, taskIndex) => {
    if (!student) return
    const progress = { ...(student.phase_progress || {}) }
    const phaseKey = `phase_${phaseNumber}`
    const tasks = progress[phaseKey] || []

    const updated = tasks.includes(taskIndex)
      ? tasks.filter(i => i !== taskIndex)
      : [...tasks, taskIndex]

    progress[phaseKey] = updated

    setStudent(prev => ({ ...prev, phase_progress: progress }))

    await supabase
      .from('students')
      .update({ phase_progress: progress })
      .eq('id', studentId)
  }

  const completePhase = async (phaseNumber) => {
    if (!student) return
    const progress = { ...(student.phase_progress || {}) }
    progress[`phase_${phaseNumber}_complete`] = true

    setStudent(prev => ({ ...prev, phase_progress: progress }))

    await supabase
      .from('students')
      .update({ phase_progress: progress })
      .eq('id', studentId)
  }

  const isPhaseComplete = (phaseNumber) => {
    return student?.phase_progress?.[`phase_${phaseNumber}_complete`] === true
  }

  const getCurrentPhase = () => {
    if (!student?.phase_progress) return 1
    for (let i = 1; i <= 5; i++) {
      if (!isPhaseComplete(i)) return i
    }
    return 5
  }

  const getCompletedPhasesCount = () => {
    let count = 0
    for (let i = 1; i <= 5; i++) {
      if (isPhaseComplete(i)) count++
    }
    return count
  }

  const updateRoadmapData = async (newRoadmapData) => {
    if (!student) return
    setStudent(prev => ({ ...prev, roadmap_data: newRoadmapData, ai_customized: true }))
    await supabase
      .from('students')
      .update({ roadmap_data: newRoadmapData, ai_customized: true })
      .eq('id', studentId)
  }

  const updateCertStatus = async (certName, status) => {
    if (!student) return
    const progress = { ...(student.phase_progress || {}) }
    const certs = progress.certifications || {}
    certs[certName] = status
    progress.certifications = certs

    setStudent(prev => ({ ...prev, phase_progress: progress }))
    await supabase
      .from('students')
      .update({ phase_progress: progress })
      .eq('id', studentId)
  }

  return {
    student,
    loading,
    error,
    toggleTask,
    completePhase,
    isPhaseComplete,
    getCurrentPhase,
    getCompletedPhasesCount,
    updateRoadmapData,
    updateCertStatus,
    refetch: fetchStudent,
  }
}
