-- FORGE Initial Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Quiz Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  year_of_study TEXT,
  department TEXT,
  quiz_mode TEXT NOT NULL CHECK (quiz_mode IN ('general', 'advanced', 'validate')),
  recommended_domain TEXT,
  second_domain TEXT,
  primary_profile TEXT,
  secondary_profile TEXT,
  score_breakdown JSONB DEFAULT '{}',
  answers JSONB DEFAULT '[]',
  gateway_answers JSONB DEFAULT '[]',
  time_available TEXT,
  priority TEXT,
  validate_target TEXT,
  validate_verdict TEXT CHECK (validate_verdict IN ('strong', 'caution', 'redirect', NULL)),
  completion_rate NUMERIC DEFAULT 0,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_domain ON quiz_sessions(recommended_domain);
CREATE INDEX IF NOT EXISTS idx_sessions_mode ON quiz_sessions(quiz_mode);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON quiz_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON quiz_sessions(student_email);

-- ============================================
-- Questions Table
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('gateway', 'general', 'advanced', 'validate', 'tiebreaker')),
  signal_type TEXT NOT NULL DEFAULT 'interest',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  domain TEXT, -- For validate questions, which domain they belong to
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(display_order);

-- ============================================
-- Question Options Table
-- ============================================
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id);

-- ============================================
-- Admin Events Table (audit log)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type ON admin_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON admin_events(created_at DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;

-- Quiz Sessions: Anyone can insert (quiz submission), anyone can read by ID (shareable result page)
CREATE POLICY "Anyone can insert quiz sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read quiz sessions"
  ON quiz_sessions FOR SELECT
  USING (true);

CREATE POLICY "Service role can update quiz sessions"
  ON quiz_sessions FOR UPDATE
  USING (true);

-- Questions: Anyone can read (quiz needs to fetch), only authenticated admins can modify
CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert questions"
  ON questions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update questions"
  ON questions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete questions"
  ON questions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Question Options: Same as questions
CREATE POLICY "Anyone can read options"
  ON question_options FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert options"
  ON question_options FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update options"
  ON question_options FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete options"
  ON question_options FOR DELETE
  USING (auth.role() = 'authenticated');

-- Admin Events: Only authenticated users
CREATE POLICY "Authenticated users can read events"
  ON admin_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert events"
  ON admin_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_sessions_updated_at
  BEFORE UPDATE ON quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Realtime subscriptions
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_sessions;
