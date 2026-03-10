-- FORGE v2 Migration: Student Dashboard + Roadmap Templates
-- Run after 001_initial_schema.sql

-- ============================================
-- Add columns to quiz_sessions
-- ============================================
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS result_rejected BOOLEAN DEFAULT FALSE;
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS alternate_domain_shown TEXT;
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS abandoned_at TIMESTAMPTZ;
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS abandonment_email_sent BOOLEAN;

-- ============================================
-- Students Table (for dashboard auth)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id               UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  email            TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  year_of_study    TEXT,
  department       TEXT,
  quiz_session_id  UUID REFERENCES quiz_sessions(id),
  domain           TEXT,
  profile_type     TEXT,
  roadmap_data     JSONB,
  ai_customized    BOOLEAN DEFAULT FALSE,
  phase_progress   JSONB DEFAULT '{}',
  last_active      TIMESTAMPTZ,
  ai_messages_today    INTEGER DEFAULT 0,
  ai_messages_reset_date DATE,
  weekly_digest        BOOLEAN DEFAULT TRUE,
  onboarding_complete  BOOLEAN DEFAULT FALSE,
  streak_days          INTEGER DEFAULT 0,
  last_active_date     DATE
);

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_domain ON students(domain);

-- ============================================
-- Roadmap Templates Table (admin editable)
-- ============================================
CREATE TABLE IF NOT EXISTS roadmap_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain          TEXT UNIQUE NOT NULL,
  version         INTEGER DEFAULT 1,
  is_active       BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      TEXT,
  phases          JSONB NOT NULL,
  certifications  JSONB NOT NULL,
  salary_data     JSONB NOT NULL,
  change_log      JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_roadmap_templates_domain ON roadmap_templates(domain);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_templates ENABLE ROW LEVEL SECURITY;

-- Students: users can read/update their own data
CREATE POLICY "Students can read own data"
  ON students FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Students can update own data"
  ON students FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert students"
  ON students FOR INSERT
  WITH CHECK (true);

-- Service role can read all students (for admin/server)
CREATE POLICY "Service role can read all students"
  ON students FOR SELECT
  USING (auth.role() = 'service_role');

-- Roadmap Templates: anyone can read, only authenticated (admin) can modify
CREATE POLICY "Anyone can read roadmap templates"
  ON roadmap_templates FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert roadmap templates"
  ON roadmap_templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update roadmap templates"
  ON roadmap_templates FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete roadmap templates"
  ON roadmap_templates FOR DELETE
  USING (auth.role() = 'authenticated');
