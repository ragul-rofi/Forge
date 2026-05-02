# SRINI Voice Agent - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STUDENT DEVICE                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    FORGE Web App                              │ │
│  │                                                               │ │
│  │  Quiz Flow:                                                   │ │
│  │  1. Landing → 2. Quiz → 3. Result Page                       │ │
│  │                              │                                │ │
│  │                              ▼                                │ │
│  │  ┌─────────────────────────────────────────────────────┐    │ │
│  │  │  SRINI Card Component                               │    │ │
│  │  │  ┌───────────────────────────────────────────────┐  │    │ │
│  │  │  │  🎙 Talk to SRINI                            │  │    │ │
│  │  │  │                                               │  │    │ │
│  │  │  │  [▶ Talk Now — Browser Call] [FREE]         │  │    │ │
│  │  │  │                                               │  │    │ │
│  │  │  │  Or prefer a real phone call? →              │  │    │ │
│  │  │  │                                               │  │    │ │
│  │  │  │  ◉ EN ◉ தமிழ் ◉ हिंदी ◉ తెలుగు ◉ മലയ ◉ ಕನ್ನಡ │  │    │ │
│  │  │  └───────────────────────────────────────────────┘  │    │ │
│  │  └─────────────────────────────────────────────────────┘    │ │
│  │                              │                                │ │
│  │                              │ Click "Talk Now"               │ │
│  │                              ▼                                │ │
│  │  ┌─────────────────────────────────────────────────────┐    │ │
│  │  │  WebCallModal (Full Screen)                        │    │ │
│  │  │  ┌───────────────────────────────────────────────┐  │    │ │
│  │  │  │         🎙 SRINI                             │  │    │ │
│  │  │  │    Your FORGE Voice Guide                    │  │    │ │
│  │  │  │                                               │  │    │ │
│  │  │  │    ╔══════════════════════════╗              │  │    │ │
│  │  │  │    ║  ████ ██ █ ████ ███ █   ║ ← Waveform  │  │    │ │
│  │  │  │    ╚══════════════════════════╝              │  │    │ │
│  │  │  │                                               │  │    │ │
│  │  │  │         ● LIVE  0:42                         │  │    │ │
│  │  │  │                                               │  │    │ │
│  │  │  │    [🎙 Mute]  [📵 End Call]                 │  │    │ │
│  │  │  └───────────────────────────────────────────────┘  │    │ │
│  │  └─────────────────────────────────────────────────────┘    │ │
│  │                                                               │ │
│  │  Vapi Web SDK (@vapi-ai/web)                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              │ WebRTC Audio Stream                 │
│                              ▼                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                        VAPI PLATFORM                                │
│                     (vapi.ai - Voice AI)                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  SRINI Assistant (asst_xxxxx)                               │  │
│  │                                                              │  │
│  │  Configuration:                                              │  │
│  │  • First Message: "Hey {{student_name}}..."                 │  │
│  │  • System Prompt: Full SRINI personality & rules            │  │
│  │  • Variables: student_name, domain, profile_type, etc.      │  │
│  │  • Max Duration: 540 seconds (9 minutes)                    │  │
│  │  • Recording: Enabled                                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Audio Processing Pipeline:                                        │
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │  Deepgram    │      │   Claude     │      │ ElevenLabs   │    │
│  │  Nova-2      │ ───► │   Haiku      │ ───► │  Turbo v2.5  │    │
│  │             │      │              │      │              │    │
│  │  Speech-to-  │      │  Language    │      │  Text-to-    │    │
│  │  Text (STT)  │      │  Model (LLM) │      │  Speech (TTS)│    │
│  │             │      │              │      │              │    │
│  │  • Multi-    │      │  • Fast      │      │  • Indian    │    │
│  │    lingual   │      │    responses │      │    English   │    │
│  │  • Low       │      │  • Context-  │      │  • Low       │    │
│  │    latency   │      │    aware     │      │    latency   │    │
│  └──────────────┘      └──────────────┘      └──────────────┘    │
│                                                                     │
│  Latency: ~400-700ms end-to-end                                   │
│                                                                     │
│                              │                                     │
│                              │ Webhooks (on call events)           │
│                              ▼                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    FORGE BACKEND (Railway)                          │
│                      Node.js + Express                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  POST /api/srini-webhook                                    │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │  Event: end-of-call-report                            │  │  │
│  │  │  1. Receive call data from Vapi                       │  │  │
│  │  │  2. Extract student commitment from transcript        │  │  │
│  │  │  3. Detect primary language used                      │  │  │
│  │  │  4. Update voice_sessions table in Supabase           │  │  │
│  │  │  5. Send post-call email to student                   │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  Event: call-started                                         │  │
│  │  • Update call status to 'active'                           │  │
│  │                                                              │  │
│  │  Event: call-failed                                          │  │
│  │  • Update call status to 'failed'                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  POST /api/srini-call-outbound (Optional - Phone Calls)    │  │
│  │  1. Receive phone number from frontend                     │  │
│  │  2. Call Vapi API to initiate outbound call                │  │
│  │  3. Vapi calls student via Twilio                          │  │
│  │  4. Log session to database                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  POST /api/srini-log-session                                │  │
│  │  1. Receive call ID from frontend                          │  │
│  │  2. Log web call session to database                       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Email Service (Nodemailer + Gmail)                        │  │
│  │  Sends post-call summary with:                             │  │
│  │  • Call summary                                             │  │
│  │  • Student commitment                                       │  │
│  │  • Recording link                                           │  │
│  │  • Dashboard link                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│                              ▼                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    SUPABASE DATABASE                                │
│                      PostgreSQL                                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  voice_sessions                                             │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │  id                    uuid PRIMARY KEY                │  │  │
│  │  │  created_at            timestamptz                     │  │  │
│  │  │  student_name          text                            │  │  │
│  │  │  student_email         text                            │  │  │
│  │  │  quiz_session_id       uuid (FK)                       │  │  │
│  │  │  vapi_call_id          text UNIQUE                     │  │  │
│  │  │  call_type             text (web/outbound/inbound)     │  │  │
│  │  │  call_status           text (initiated/active/ended)   │  │  │
│  │  │  duration_seconds      integer                         │  │  │
│  │  │  recording_url         text                            │  │  │
│  │  │  transcript            text                            │  │  │
│  │  │  summary               text                            │  │  │
│  │  │  student_commitment    text                            │  │  │
│  │  │  language_used         text (en/ta/hi/te/ml/kn)        │  │  │
│  │  │  languages_switched    text[]                          │  │  │
│  │  │  sentiment_score       float                           │  │  │
│  │  │  domain                text                            │  │  │
│  │  │  profile_type          text                            │  │  │
│  │  │  email_sent            boolean                         │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  daily_insights (Future: Admin Analytics)                  │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │  id                    uuid PRIMARY KEY                │  │  │
│  │  │  date                  date UNIQUE                     │  │  │
│  │  │  top_fears             jsonb                           │  │  │
│  │  │  top_questions         jsonb                           │  │  │
│  │  │  confused_domain       text                            │  │  │
│  │  │  confident_domain      text                            │  │  │
│  │  │  raw_response          jsonb                           │  │  │
│  │  │  calls_analyzed        integer                         │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  RLS Policies:                                                     │
│  • Students can view their own sessions                            │
│  • Admins can view all sessions                                    │
│  • Service role can insert/update                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Web Call Flow (Primary)

```
┌─────────┐
│ Student │
│ Clicks  │
│ "Talk   │
│  Now"   │
└────┬────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 1. Browser requests microphone access   │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 2. Vapi Web SDK initializes             │
│    • Public Key: VITE_VAPI_PUBLIC_KEY   │
│    • Assistant ID: VITE_VAPI_ASSISTANT  │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 3. Assistant overrides injected         │
│    {                                     │
│      student_name: "Rahul",             │
│      domain: "Cloud Computing",         │
│      profile_type: "Builder",           │
│      quiz_emotion: "curiosity",         │
│      domain_context: "...",             │
│      salary_data: "..."                 │
│    }                                     │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 4. WebRTC connection established        │
│    Student ←──────────────────→ Vapi    │
│    (Audio stream, bidirectional)        │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 5. SRINI speaks first message           │
│    "Hey Rahul, SRINI here from FORGE.   │
│     Your quiz points to Cloud           │
│     Computing..."                        │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 6. Real-time conversation                │
│    Student speaks → Deepgram (STT)      │
│    → Claude (LLM) → ElevenLabs (TTS)    │
│    → Student hears response             │
│    (Latency: ~400-700ms)                │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 7. Student ends call                     │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 8. Vapi sends webhook to backend        │
│    POST /api/srini-webhook              │
│    {                                     │
│      type: "end-of-call-report",        │
│      call: { id, duration, ... },       │
│      transcript: "...",                 │
│      summary: "...",                    │
│      recordingUrl: "..."                │
│    }                                     │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 9. Backend processes webhook             │
│    • Extract commitment from transcript  │
│    • Detect primary language             │
│    • Update voice_sessions table         │
│    • Send post-call email                │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 10. Student receives email               │
│     • Call summary                       │
│     • Commitment highlighted             │
│     • Recording link                     │
│     • Dashboard link                     │
└─────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      Result.jsx                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Quiz Result Display                                   │  │
│  │  • Profile Reveal                                      │  │
│  │  • Domain Card                                         │  │
│  │  • Salary Card                                         │  │
│  │  • Roadmap Phases                                      │  │
│  │  • Start Today Timer                                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  <SriniCard                                            │  │
│  │    student={...}                                       │  │
│  │    domain={domain}                                     │  │
│  │    profile={profile}                                   │  │
│  │    quizEmotion={emotion}                               │  │
│  │    sessionId={sessionId}                               │  │
│  │  />                                                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                    SriniCard.jsx                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  State Management:                                     │  │
│  │  • callState: idle/requesting_mic/calling/active/ended │  │
│  │  • showPhoneOption: boolean                            │  │
│  │  • callData: object                                    │  │
│  │  • errorMessage: string                                │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Vapi SDK Integration:                                 │  │
│  │  • vapi.start(assistantId, overrides)                  │  │
│  │  • vapi.on('call-start', ...)                          │  │
│  │  • vapi.on('call-end', ...)                            │  │
│  │  • vapi.on('error', ...)                               │  │
│  │  • vapi.stop()                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
│          ┌───────────────┼───────────────┐                   │
│          ▼               ▼               ▼                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ WebCallModal │ │ PhoneCall    │ │ PostCall     │        │
│  │              │ │ Option       │ │ Summary      │        │
│  │ (Active)     │ │ (Optional)   │ │ (Ended)      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│  • React 18                                                 │
│  • Vite                                                     │
│  • @vapi-ai/web SDK                                         │
│  • Tailwind CSS                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                │
│  • Node.js                                                  │
│  • Express                                                  │
│  • Nodemailer (Gmail)                                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│  • Supabase (PostgreSQL)                                    │
│  • Row Level Security (RLS)                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Vapi (Voice Platform)                                │  │
│  │  • WebRTC orchestration                               │  │
│  │  • Assistant management                               │  │
│  │  • Webhook delivery                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Deepgram (Speech-to-Text)                            │  │
│  │  • Nova-2 model                                       │  │
│  │  • Multilingual support                               │  │
│  │  • Low latency                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Anthropic Claude (LLM)                               │  │
│  │  • Haiku model (fast)                                 │  │
│  │  • Context-aware responses                            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ElevenLabs (Text-to-Speech)                          │  │
│  │  • Turbo v2.5 model                                   │  │
│  │  • Indian English voice                               │  │
│  │  • Low latency                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Twilio (Optional - Phone Calls)                      │  │
│  │  • PSTN connectivity                                  │  │
│  │  • Outbound calling                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Security & Privacy

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA PROTECTION                           │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  In Transit:                                          │  │
│  │  • WebRTC encrypted (DTLS-SRTP)                       │  │
│  │  • HTTPS for all API calls                            │  │
│  │  • Webhook signatures verified                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  At Rest:                                             │  │
│  │  • Supabase encryption                                │  │
│  │  • Recording URLs expire after 30 days                │  │
│  │  • Transcripts stored securely                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Access Control:                                      │  │
│  │  • RLS policies on voice_sessions                     │  │
│  │  • Students see only their own data                   │  │
│  │  • Admins have full access                            │  │
│  │  • Service role for backend operations                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Low latency (<1 second)
- ✅ Scalability (handles thousands of concurrent calls)
- ✅ Multilingual support (6 languages)
- ✅ Cost efficiency (₹0 to start, pay as you grow)
- ✅ Security (encrypted, RLS policies)
- ✅ Observability (logs, transcripts, analytics)
