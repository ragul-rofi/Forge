// Lightweight module-level cache so Supabase questions are fetched once
// and then used by every quiz session in that browser tab.
import {
  GENERAL_QUESTIONS,
  ADVANCED_QUESTIONS,
  getQuestionsForMode,
} from '../data/questions'

const cache = {
  loaded: false,
  general: null,
  advanced: null,
}

function buildOptions(opts, questionId) {
  const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f']
  return (opts || [])
    .filter((o) => o.question_id === questionId)
    .sort((a, b) => a.display_order - b.display_order)
    .map((o, i) => ({
      id: LETTERS[i] || String(i),
      text: o.option_text,
      scores: o.scores || {},
    }))
}

export async function loadQuestionsFromDB(supabase) {
  if (cache.loaded) return
  try {
    const { data: qs, error: qErr } = await supabase
      .from('questions')
      .select('*')
      .in('question_type', ['general', 'advanced'])
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (qErr || !qs?.length) return

    const { data: opts } = await supabase
      .from('question_options')
      .select('*')
      .order('display_order', { ascending: true })

    const generalDB = qs
      .filter((q) => q.question_type === 'general')
      .map((q, i) => ({
        id: `g${i + 1}`,
        question_number: i + 1,
        mode: 'general',
        signal_type: q.signal_type || 'interest',
        question_type: 'scenario',
        question_text: q.question_text,
        options: buildOptions(opts, q.id),
        _dbId: q.id,
      }))

    const advancedDB = qs
      .filter((q) => q.question_type === 'advanced')
      .map((q, i) => ({
        id: `a${String(i + 1).padStart(2, '0')}`,
        question_number: i + 1,
        mode: 'advanced',
        signal_type: q.signal_type || 'aptitude',
        question_type: 'scenario',
        question_text: q.question_text,
        options: buildOptions(opts, q.id),
        _dbId: q.id,
      }))

    // Only replace local data if DB has at least as many questions
    // (guards against partial seeding breaking the quiz)
    if (generalDB.length >= GENERAL_QUESTIONS.length) cache.general = generalDB
    if (advancedDB.length >= ADVANCED_QUESTIONS.length) cache.advanced = advancedDB

    cache.loaded = cache.general !== null || cache.advanced !== null
  } catch (err) {
    console.warn('[questionsCache] load failed, quiz will use local data:', err)
  }
}

export function getCachedQuestionsForMode(mode, validateTarget) {
  if (cache.loaded) {
    const general = cache.general || GENERAL_QUESTIONS
    const advanced = cache.advanced || ADVANCED_QUESTIONS
    if (mode === 'general') return general
    if (mode === 'advanced') return [...general, ...advanced]
    // validate mode uses local VALIDATE_QUESTIONS + domain-specific slices
    // (those have tag/verdict logic tied to local IDs — keep as-is)
  }
  return getQuestionsForMode(mode, validateTarget)
}
