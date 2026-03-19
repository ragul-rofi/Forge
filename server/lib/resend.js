import nodemailer from 'nodemailer'
import { DOMAIN_NAMES, DOMAIN_COLORS } from './constants.js'

const MAIL_ENABLED = process.env.MAIL_ENABLED !== 'false'
const MAIL_FAIL_HARD = process.env.MAIL_FAIL_HARD === 'true'

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user,
      pass,
    },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000,
    dnsTimeout: 8000,
  })

  return transporter
}

const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || process.env.GMAIL_USER || 'srini@tryforge.site'
const FROM_NAME = 'FORGE'

async function sendEmail({ to, subject, html }) {
  if (!MAIL_ENABLED) {
    return { id: 'mail-disabled' }
  }

  const activeTransporter = getTransporter()
  if (!activeTransporter) {
    const err = new Error('SMTP not configured: set GMAIL_USER and GMAIL_APP_PASSWORD')
    if (MAIL_FAIL_HARD) throw err
    console.warn('[mail] skipped send:', err.message)
    return { id: 'mail-not-configured' }
  }

  try {
    const info = await activeTransporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    return info
  } catch (err) {
    const code = err?.code || 'UNKNOWN'
    const message = err?.message || 'Unknown mail error'
    if (MAIL_FAIL_HARD) throw err
    console.warn(`[mail] send suppressed (${code}): ${message}`)
    return { id: `mail-failed-${code.toLowerCase()}` }
  }
}

const FROM_EMAIL = 'aarav@tryforge.site'
const FROM_NAME = 'FORGE'

const PROFILE_DESCRIPTIONS = {
  maker: "You're the kind of person who can't leave a problem alone until it's fixed. You notice what's broken before others do, and you get real satisfaction from making things work — not just understanding them in theory, but getting your hands in and building something.",
  thinker: "You need to understand why before you act. Patterns fascinate you — you notice connections other people walk past. You get genuinely frustrated when someone skips the explanation and jumps to the answer.",
  protector: "You see what could go wrong before anyone else does. You're skeptical by default — and that's not pessimism, it's a rare and valuable quality. You think adversarially: what's the weakness here? Who could exploit this?",
  creator: "You notice how things look and feel — not just whether they work. Bad design bothers you in a way that's hard to explain to people who don't feel it. You naturally gravitate toward making things that are not just functional, but felt.",
  leader: "You think in outcomes and people. You're naturally the one who gets things moving when everyone else is stuck — not because you're bossy, but because you can see the path forward.",
  helper: "You understand what people need before they fully say it themselves. People feel better after talking to you. Your instinct is always toward the impact on people, not just the technical elegance of a solution.",
  explorer: "You go down rabbit holes and come back with three new questions. You get restless doing the same thing twice. You're energized by novelty — new ideas, new domains, new angles on old problems.",
}

const PROFILE_EMOJIS = {
  maker: '🔨', thinker: '🧠', protector: '🛡️', creator: '🎨',
  leader: '👑', helper: '🤝', explorer: '🧭',
}

export async function sendResultEmail({ name, email, domain, sessionId, profile, roadmap }) {
  const domainName = DOMAIN_NAMES[domain] || domain
  const domainColor = DOMAIN_COLORS[domain] || '#60a5fa'
  const profileDesc = PROFILE_DESCRIPTIONS[profile] || ''
  const profileEmoji = PROFILE_EMOJIS[profile] || ''
  const profileName = profile ? profile.charAt(0).toUpperCase() + profile.slice(1) : ''
  const baseUrl = process.env.CLIENT_URL || 'https://tryforge.site'

  const phasesHtml = roadmap?.phases
    ? roadmap.phases.map((p) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #222;color:#888;font-family:monospace;font-size:12px;">Phase ${p.number}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #222;color:#e0e0e0;font-size:14px;">${p.title}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #222;color:#888;font-size:12px;">${p.duration}</td>
        </tr>
      `).join('')
    : ''

  const certsHtml = roadmap?.certifications
    ? roadmap.certifications
        .filter((c) => c.priority >= 4)
        .map((c) => `<li style="color:#e0e0e0;margin-bottom:4px;">⭐ ${c.name}</li>`)
        .join('')
    : ''

  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `Your FORGE result — ${domainName} awaits`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c0c0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#f5f5f5;font-size:28px;letter-spacing:-2px;font-weight:800;margin:0;">FORGE</h1>
      <p style="color:#666;font-size:12px;font-style:italic;margin:4px 0 0;">Don't find your path. Forge it.</p>
    </div>

    <p style="color:#e0e0e0;font-size:16px;margin-bottom:24px;">Hey ${name},</p>

    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:40px;">${profileEmoji}</span>
      <h2 style="color:#f5f5f5;font-size:22px;margin:8px 0 4px;text-transform:uppercase;letter-spacing:1px;">
        THE ${profileName.toUpperCase()}
      </h2>
    </div>

    <p style="color:#aaa;font-size:14px;line-height:1.6;font-style:italic;margin-bottom:24px;">
      ${profileDesc}
    </p>

    <div style="text-align:center;margin:32px 0;">
      <p style="color:#888;font-size:13px;margin-bottom:8px;">People like you typically forge their path in:</p>
      <h2 style="color:${domainColor};font-size:26px;font-weight:800;margin:0;">${domainName}</h2>
    </div>

    ${phasesHtml ? `
    <div style="margin:24px 0;">
      <p style="color:#888;font-family:monospace;font-size:11px;text-transform:uppercase;margin-bottom:12px;">YOUR ROADMAP</p>
      <table style="width:100%;border-collapse:collapse;">${phasesHtml}</table>
    </div>
    ` : ''}

    ${certsHtml ? `
    <div style="margin:24px 0;">
      <p style="color:#888;font-family:monospace;font-size:11px;text-transform:uppercase;margin-bottom:8px;">PRIORITY CERTIFICATIONS</p>
      <ul style="padding-left:16px;margin:0;">${certsHtml}</ul>
    </div>
    ` : ''}

    <div style="text-align:center;margin:32px 0;">
      <a href="${baseUrl}/result/${sessionId}" 
         style="display:inline-block;background:#f5f5f5;color:#0c0c0c;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        View Your Full Roadmap →
      </a>
    </div>

    <div style="text-align:center;border-top:1px solid #222;padding-top:24px;margin-top:32px;">
      <p style="color:#666;font-size:13px;font-style:italic;">You got this. — The FORGE team</p>
    </div>

  </div>
</body>
</html>
    `,
  })

  if (error) {
    console.error('[resend] email error:', error)
    throw new Error(error.message)
  }

  return data
}

export async function sendDigestEmail({ name, email, domain, currentPhase, tasksRemaining, daysSinceStart, streakDays }) {
  const domainName = DOMAIN_NAMES[domain] || domain
  const domainColor = DOMAIN_COLORS[domain] || '#60a5fa'
  const baseUrl = process.env.CLIENT_URL || 'https://tryforge.site'

  return sendEmail({
    to: email,
    subject: `Your FORGE result — ${domainName} awaits`,
    html,
  })
}

export async function sendDigestEmail({ name, email, domain, currentPhase, tasksRemaining, daysSinceStart, streakDays }) {
  const domainName = DOMAIN_NAMES[domain] || domain
  const domainColor = DOMAIN_COLORS[domain] || '#60a5fa'
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c0c0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#f5f5f5;font-size:24px;letter-spacing:-2px;font-weight:800;margin:0;">FORGE</h1>
    </div>
    <p style="color:#e0e0e0;font-size:16px;">Hey ${name},</p>
    <p style="color:#aaa;font-size:14px;line-height:1.6;">
      Here's your weekly update for <strong style="color:${domainColor};">${domainName}</strong>.
    </p>
    <div style="background:#1a1a2e;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="color:#888;font-size:12px;margin:0 0 12px;">YOUR STATUS</p>
      <p style="color:#e0e0e0;font-size:14px;margin:4px 0;">📍 Phase ${currentPhase} of 5 — ${tasksRemaining}</p>
      <p style="color:#e0e0e0;font-size:14px;margin:4px 0;">📅 ${daysSinceStart} days since you started</p>
      ${streakDays > 0 ? `<p style="color:#f97316;font-size:14px;margin:4px 0;">🔥 ${streakDays} day streak</p>` : ''}
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${baseUrl}/dashboard" style="display:inline-block;background:${domainColor};color:#0c0c0c;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        Open Your Dashboard →
      </a>
    </div>
    <div style="text-align:center;border-top:1px solid #222;padding-top:16px;margin-top:24px;">
      <p style="color:#555;font-size:11px;">
        <a href="${baseUrl}/api/unsubscribe-digest" style="color:#555;text-decoration:underline;">Unsubscribe from weekly updates</a>
      </p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail({
    to: email,
    subject: `Your FORGE week — Phase ${currentPhase} status`,
    html,
  })
}

export async function sendAbandonmentEmail(name, email, sessionId) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const firstName = (name || 'there').split(' ')[0]

  const html = `
  <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #e4e4e7;">
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #fafafa;">
      You were mid-quiz on FORGE
    </h2>
    <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      Hey ${firstName} — you started the career profiler quiz but didn't finish.
      It takes about 4 minutes to complete, and you'll get your personalized
      domain recommendation, salary data, and a step-by-step roadmap.
    </p>
    <a href="${baseUrl}/quiz" style="display: inline-block; background: #60a5fa; color: #09090b; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">
      Continue My Quiz →
    </a>
    <p style="color: #71717a; font-size: 12px; margin: 24px 0 0;">
      No pressure — your progress is saved.
    </p>
  </div>
  `

  return sendEmail({
    to: email,
    subject: "You were mid-quiz on FORGE — 4 minutes to finish?",
    html,
  })
}

export async function sendAbandonmentEmail(name, email, sessionId) {
  const baseUrl = process.env.CLIENT_URL || 'https://tryforge.site'
  const firstName = (name || 'there').split(' ')[0]

  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: "You were mid-quiz on FORGE — 4 minutes to finish?",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0c0c0c;font-family:sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <h1 style="color:#f5f5f5;font-size:24px;letter-spacing:-2px;font-weight:800;">FORGE</h1>
    <h2 style="color:#fafafa;font-size:20px;margin:0 0 16px;">You were mid-quiz on FORGE</h2>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hey ${firstName} — you started the career profiler quiz but didn't finish.
      It takes about 4 minutes. You'll get your domain recommendation,
      salary data, and a full roadmap.
    </p>
    <a href="${baseUrl}/quiz" 
       style="display:inline-block;background:#60a5fa;color:#09090b;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:600;">
      Continue My Quiz →
    </a>
    <p style="color:#71717a;font-size:12px;margin:24px 0 0;">Your progress is saved.</p>
  </div>
</body>
</html>
    `,
  })

  if (error) throw new Error(error.message)
  return data
}