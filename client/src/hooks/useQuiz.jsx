import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { GATEWAY_QUESTIONS, getQuestionsForMode } from '../data/questions'
import { calculateProfile, resolveDomain, applyGatewayOverride, calculateValidateVerdict } from '../lib/scoring'
import { loadQuestionsFromDB, getCachedQuestionsForMode } from '../lib/questionsCache'

const STORAGE_KEY = 'forge-quiz-state'
const STORAGE_EXPIRY_DAYS = 7

const initialState = {
  phase: 'collect_info',
  studentInfo: { name: '', email: '', year: '', department: '' },
  mode: null,
  validateTarget: null,
  gatewayAnswers: [],
  currentQuestionIndex: 0,
  answers: [],
  sessionId: null,
  result: null,
  savedAt: null,
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.phase === 'done') return initialState

      // Check 7-day expiry
      if (parsed.savedAt) {
        const elapsed = Date.now() - parsed.savedAt
        if (elapsed > STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(STORAGE_KEY)
          return initialState
        }
      }

      return parsed
    }
  } catch (e) {
    // ignore
  }
  return initialState
}

export function useQuiz() {
  const [state, setState] = useState(loadState)

  // Load questions from Supabase in the background; quiz falls back to local data if unavailable
  useEffect(() => {
    loadQuestionsFromDB(supabase)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }))
  }, [state])

  const questions = state.mode ? getCachedQuestionsForMode(state.mode, state.validateTarget) : []
  const gatewayQuestions = GATEWAY_QUESTIONS
  const totalQuestions = questions.length
  const isGatewayPhase = state.phase === 'gateway'
  const currentGatewayQuestion = isGatewayPhase ? gatewayQuestions[state.gatewayAnswers.length] : null
  const currentQuestion = state.phase === 'quiz' ? questions[state.currentQuestionIndex] : null

  const submitStudentInfo = useCallback(async (info) => {
    setState(prev => ({
      ...prev,
      studentInfo: info,
      phase: 'select_path',
    }))
  }, [])

  const submitEmail = useCallback(async (email) => {
    setState(prev => ({
      ...prev,
      studentInfo: { ...prev.studentInfo, email },
    }))

    // Create a partial session so we can track abandonment
    try {
      const { data } = await supabase
        .from('quiz_sessions')
        .insert({
          student_email: email,
          student_name: state.studentInfo.name,
          year_of_study: state.studentInfo.year,
          department: state.studentInfo.department || null,
          quiz_mode: state.mode,
          completion_rate: 0,
          abandoned_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (data?.id) {
        setState(prev => ({ ...prev, sessionId: data.id }))
      }
    } catch {
      // Non-critical — abandonment tracking is best-effort
    }
  }, [state.studentInfo, state.mode])

  const proceedToGateway = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'gateway',
    }))
  }, [])

  const selectMode = useCallback((mode, validateTarget = null) => {
    setState(prev => ({
      ...prev,
      mode,
      validateTarget,
      // For advanced and validate, we need email before starting
      phase: (mode === 'advanced' || mode === 'validate') ? 'collect_email' : 'gateway',
    }))
  }, [])

  // Derive timeAvailable from the year of study collected in the student info form
  const yearToTimeAvailable = (year) => {
    if (year === '1st') return '3plus_yr'
    if (year === '2nd') return '1_2yr'
    if (year === '3rd') return '1_2yr'
    if (year === 'Final') return 'under_6mo'
    return ''  // graduated / unknown
  }

  const answerGateway = useCallback((answer) => {
    // Only gw2 (priority) remains — proceed to quiz after 1 answer
    setState(prev => {
      const newGatewayAnswers = [...prev.gatewayAnswers, answer]
      return { ...prev, gatewayAnswers: newGatewayAnswers, phase: 'quiz' }
    })
  }, [])

  const answerQuestion = useCallback(async (questionId, optionId, scores, tag) => {
    setState(prev => {
      const modeQuestions = getCachedQuestionsForMode(prev.mode, prev.validateTarget)
      const isReAnswer = prev.currentQuestionIndex < prev.answers.length
      const newAnswer = { questionId, optionId, scores: scores || {}, tag }

      let newAnswers
      if (isReAnswer) {
        // Re-answering a previous question — replace in-place
        newAnswers = [...prev.answers]
        newAnswers[prev.currentQuestionIndex] = newAnswer
      } else {
        // Answering a new question — append
        newAnswers = [...prev.answers, newAnswer]
      }

      const nextIndex = prev.currentQuestionIndex + 1
      const completionRate = Math.round((newAnswers.length / modeQuestions.length) * 100)

      // Update completion_rate in Supabase
      if (prev.sessionId) {
        supabase
          .from('quiz_sessions')
          .update({ completion_rate: completionRate, answers: newAnswers })
          .eq('id', prev.sessionId)
          .then(() => {})
          .catch(() => {})
      }

      // Only finish quiz if we're at the last question AND all questions are answered
      if (nextIndex >= modeQuestions.length && newAnswers.length >= modeQuestions.length) {
        // Quiz complete — calculate results
        const profileResult = calculateProfile(newAnswers)
        const domainResult = resolveDomain(profileResult.primary, profileResult.auxiliaryScores)
        const timeAvailable = yearToTimeAvailable(prev.studentInfo?.year || '')
        const priority = prev.gatewayAnswers[0]?.tag || '' // gw2 answer

        let recommendedDomain = domainResult.primary
        let secondDomain = domainResult.secondary
        let overrideReason = null

        if (prev.mode === 'validate') {
          const validateAnswers = newAnswers.slice(0, 4)
          const fitAnswers = newAnswers.slice(4)
          const fitScore = fitAnswers.reduce((sum, a) => {
            const totalScore = Object.values(a.scores || {}).reduce((s, v) => s + v, 0)
            return sum + totalScore
          }, 0)
          const verdict = calculateValidateVerdict(validateAnswers, fitScore)

          return {
            ...prev,
            answers: newAnswers,
            currentQuestionIndex: nextIndex,
            phase: 'done',
            result: {
              ...profileResult,
              recommendedDomain: prev.validateTarget,
              secondDomain: domainResult.primary,
              overrideReason: null,
              validateVerdict: verdict,
              timeAvailable,
              priority,
              q12Tag: newAnswers.find(a => a.questionId === 'g12')?.tag || null,
            },
          }
        }

        const override = applyGatewayOverride(recommendedDomain, timeAvailable, priority)
        if (override.reason) {
          recommendedDomain = override.domain
          overrideReason = override.reason
        }

        return {
          ...prev,
          answers: newAnswers,
          currentQuestionIndex: nextIndex,
          phase: 'done',
          result: {
            ...profileResult,
            recommendedDomain,
            secondDomain,
            overrideReason,
            validateVerdict: null,
            timeAvailable,
            priority,
            q12Tag: newAnswers.find(a => a.questionId === 'g12')?.tag || null,
          },
        }
      }

      return {
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: nextIndex,
      }
    })
  }, [])

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.currentQuestionIndex <= 0) return prev
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }
    })
  }, [])

  const goForward = useCallback(() => {
    setState(prev => {
      const modeQuestions = getCachedQuestionsForMode(prev.mode, prev.validateTarget)
      // Can only go forward if that question has been answered already
      if (prev.currentQuestionIndex >= prev.answers.length) return prev
      if (prev.currentQuestionIndex >= modeQuestions.length - 1) return prev
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }
    })
  }, [])

  const saveSession = useCallback(async (emailOverride) => {
    const email = emailOverride || state.studentInfo.email
    if (!state.result || !email) return null

    const sessionData = {
      student_email: email,
      student_name: state.studentInfo.name,
      year_of_study: state.studentInfo.year,
      department: state.studentInfo.department || null,
      quiz_mode: state.mode,
      time_available: state.result.timeAvailable,
      priority: state.result.priority,
      gateway_answers: state.gatewayAnswers,
      answers: state.answers,
      primary_profile: state.result.primary,
      secondary_profile: state.result.secondary,
      recommended_domain: state.result.recommendedDomain,
      second_domain: state.result.secondDomain,
      validate_target: state.validateTarget,
      validate_verdict: state.result.validateVerdict,
      score_breakdown: state.result.scores,
      completion_rate: 100,
      abandoned_at: null,
    }

    try {
      if (state.sessionId) {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .update(sessionData)
          .eq('id', state.sessionId)
          .select()
          .single()
        if (error) throw error
        return data?.id
      } else {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .insert(sessionData)
          .select()
          .single()
        if (error) throw error
        const newId = data?.id
        setState(prev => ({ ...prev, sessionId: newId }))
        return newId
      }
    } catch (err) {
      console.error('Failed to save session:', err)
      // Generate a local ID for offline mode
      const localId = 'local-' + Date.now()
      setState(prev => ({ ...prev, sessionId: localId }))
      return localId
    }
  }, [state])

  const resetQuiz = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(initialState)
  }, [])

  const canGoBack = state.phase === 'quiz' && state.currentQuestionIndex > 0
  const canGoForward = state.phase === 'quiz' && state.currentQuestionIndex < state.answers.length && state.currentQuestionIndex < totalQuestions - 1
  const isReAnswering = state.phase === 'quiz' && state.currentQuestionIndex < state.answers.length
  const previousAnswer = isReAnswering ? state.answers[state.currentQuestionIndex]?.optionId : null

  return {
    state,
    questions,
    gatewayQuestions,
    totalQuestions,
    currentGatewayQuestion,
    currentQuestion,
    canGoBack,
    canGoForward,
    isReAnswering,
    previousAnswer,
    submitStudentInfo,
    submitEmail,
    proceedToGateway,
    selectMode,
    answerGateway,
    answerQuestion,
    goBack,
    goForward,
    saveSession,
    resetQuiz,
  }
}
