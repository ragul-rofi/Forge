export function calculateProfile(answers) {
  const scores = {
    maker: 0,
    thinker: 0,
    protector: 0,
    creator: 0,
    leader: 0,
    helper: 0,
    explorer: 0,
  }

  answers.forEach(answer => {
    if (answer.scores) {
      Object.entries(answer.scores).forEach(([profile, points]) => {
        scores[profile] += points
      })
    }
  })

  const sorted = Object.entries(scores).sort(([,a],[,b]) => b - a)
  const primary = sorted[0][0]
  const secondary = sorted[1][0]
  const isTie = sorted[0][1] - sorted[1][1] <= 2

  return { scores, primary, secondary, isTie }
}

export const profileToDomain = {
  maker:     { primary: 'fullstack', secondary: 'cloud' },
  thinker:   { primary: 'data',      secondary: 'ai' },
  protector: { primary: 'cyber',     secondary: 'networking' },
  creator:   { primary: 'design',    secondary: 'business' },
  leader:    { primary: 'business',  secondary: 'fullstack' },
  helper:    { primary: 'business',  secondary: 'design' },
  explorer:  { primary: 'ai',        secondary: 'data' },
}

export function applyGatewayOverride(domain, timeAvailable, priority) {
  // If under 6 months AND salary_first → avoid AI (replace with data)
  if (timeAvailable === 'under_6mo' && domain === 'ai') {
    return { 
      domain: 'data', 
      reason: 'AI takes 12–18 months. Given your timeline, Data Analytics gets you job-ready in 3–5 months — and it\'s the foundation for AI later.' 
    }
  }
  
  return { domain, reason: null }
}

export function calculateValidateVerdict(validateAnswers, fitScore) {
  const v1 = validateAnswers[0]?.tag
  const v2 = validateAnswers[1]?.tag
  const v3 = validateAnswers[2]?.tag
  const v4 = validateAnswers[3]?.tag

  const genuine_interest = v1 === 'genuine_interest'
  const tried_and_liked = v1 === 'tried_and_liked'
  const high_awareness = v2 === 'high_awareness' || v2 === 'very_high_awareness'
  const high_commitment = v3 === 'high_commitment' || v3 === 'medium_commitment'
  const low_awareness = v2 === 'low_awareness'
  const social_influence = v1 === 'social_influence'
  const salary_motivated = v1 === 'salary_motivated'
  const low_commitment = v3 === 'low_commitment'

  // STRONG verdict
  if ((genuine_interest || tried_and_liked) && high_awareness && high_commitment && fitScore >= 6) {
    return 'strong'
  }

  // REDIRECT verdict
  if (low_awareness && (social_influence || salary_motivated) && low_commitment) {
    return 'redirect'
  }

  // CAUTION for everything else
  return 'caution'
}
