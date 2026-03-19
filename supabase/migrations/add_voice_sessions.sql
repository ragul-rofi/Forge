-- Voice sessions table for SRINI
CREATE TABLE IF NOT EXISTS voice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  student_name text NOT NULL,
  student_email text NOT NULL,
  quiz_session_id uuid REFERENCES quiz_sessions(id),
  student_id uuid REFERENCES students(id),
  vapi_call_id text UNIQUE,
  call_type text NOT NULL CHECK (call_type IN ('web', 'outbound', 'inbound')),
  call_status text DEFAULT 'initiated' CHECK (call_status IN ('initiated', 'active', 'ended', 'failed')),
  duration_seconds integer,
  recording_url text,
  transcript text,
  summary text,
  student_commitment text,
  language_used text DEFAULT 'en',
  languages_switched text[],
  sentiment_score float,
  domain text,
  profile_type text,
  email_sent boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Daily insights table for admin analytics
CREATE TABLE IF NOT EXISTS daily_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  top_fears jsonb,
  top_questions jsonb,
  confused_domain text,
  confident_domain text,
  raw_response jsonb,
  calls_analyzed integer,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_sessions_student_email ON voice_sessions(student_email);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_vapi_call_id ON voice_sessions(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created_at ON voice_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_insights_date ON daily_insights(date DESC);

-- Enable RLS
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Students can view their own voice sessions"
  ON voice_sessions FOR SELECT
  USING (auth.email() = student_email);

CREATE POLICY "Service role can insert voice sessions"
  ON voice_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update voice sessions"
  ON voice_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all voice sessions"
  ON voice_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE email = auth.email()
    )
  );

CREATE POLICY "Admins can view daily insights"
  ON daily_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE email = auth.email()
    )
  );
