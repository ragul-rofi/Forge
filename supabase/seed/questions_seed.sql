-- FORGE Questions Seed Data
-- Run this after the initial schema migration
-- This seeds the questions and question_options tables with the full question bank

-- ============================================
-- GATEWAY QUESTIONS
-- ============================================

-- GW1: Time available
INSERT INTO questions (question_text, question_type, signal_type, display_order, is_active)
VALUES (
  'How much time do you have before placements or your next big opportunity?',
  'gateway', 'interest', 1, true
);

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, '3 years or more — I''m in 1st or early 2nd year',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 1
FROM questions WHERE question_text LIKE 'How much time do you have%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, '1–2 years — I''m in 2nd or 3rd year',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 2
FROM questions WHERE question_text LIKE 'How much time do you have%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Less than 6 months — final year, placements near',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 3
FROM questions WHERE question_text LIKE 'How much time do you have%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Already graduated, upskilling now',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 4
FROM questions WHERE question_text LIKE 'How much time do you have%';

-- GW2: Priority
INSERT INTO questions (question_text, question_type, signal_type, display_order, is_active)
VALUES (
  'Be completely honest — what matters most to you right now?',
  'gateway', 'interest', 2, true
);

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'A high paying job, as fast as possible. Domain doesn''t matter that much.',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 1
FROM questions WHERE question_text LIKE 'Be completely honest%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'I want to genuinely enjoy what I learn. Salary can come second.',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 2
FROM questions WHERE question_text LIKE 'Be completely honest%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Both. I won''t sacrifice one for the other.',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 3
FROM questions WHERE question_text LIKE 'Be completely honest%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'I genuinely don''t know yet. That''s why I''m here.',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 4
FROM questions WHERE question_text LIKE 'Be completely honest%';

-- ============================================
-- GENERAL QUESTIONS (12 questions)
-- ============================================

-- G1
INSERT INTO questions (question_text, question_type, signal_type, display_order, is_active)
VALUES ('In school, which kind of homework did you actually not mind doing?', 'general', 'enjoy', 1, true);

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Solving problems with a right or wrong answer — maths, logic, physics',
  '{"maker":2,"thinker":2,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 1
FROM questions WHERE question_text LIKE 'In school, which kind%' AND question_type='general';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Writing essays or presentations — expressing an idea in my own way',
  '{"maker":0,"thinker":0,"protector":0,"creator":2,"leader":1,"helper":0,"explorer":0}'::jsonb, 2
FROM questions WHERE question_text LIKE 'In school, which kind%' AND question_type='general';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Group projects — I liked organizing people and getting things done together',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":2,"helper":1,"explorer":0}'::jsonb, 3
FROM questions WHERE question_text LIKE 'In school, which kind%' AND question_type='general';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Drawing, building models, making something visual or physical',
  '{"maker":1,"thinker":0,"protector":0,"creator":2,"leader":0,"helper":0,"explorer":0}'::jsonb, 4
FROM questions WHERE question_text LIKE 'In school, which kind%' AND question_type='general';

-- G2
INSERT INTO questions (question_text, question_type, signal_type, display_order, is_active)
VALUES ('Your friend is really upset about something. What do you naturally do first?', 'general', 'natural', 2, true);

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Just listen without saying much — being there feels like the right thing',
  '{"maker":0,"thinker":0,"protector":0,"creator":0,"leader":0,"helper":2,"explorer":0}'::jsonb, 1
FROM questions WHERE question_text LIKE 'Your friend is really upset%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Figure out exactly what happened and find a practical solution',
  '{"maker":1,"thinker":2,"protector":0,"creator":0,"leader":0,"helper":0,"explorer":0}'::jsonb, 2
FROM questions WHERE question_text LIKE 'Your friend is really upset%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Say something — a joke, a story — to shift their mood',
  '{"maker":0,"thinker":0,"protector":0,"creator":2,"leader":1,"helper":0,"explorer":0}'::jsonb, 3
FROM questions WHERE question_text LIKE 'Your friend is really upset%';

INSERT INTO question_options (question_id, option_text, scores, display_order)
SELECT id, 'Think about what I''d do in their position and offer that exact plan',
  '{"maker":0,"thinker":1,"protector":0,"creator":0,"leader":2,"helper":0,"explorer":0}'::jsonb, 4
FROM questions WHERE question_text LIKE 'Your friend is really upset%';

-- NOTE: The remaining 10 general questions and all advanced/validate questions
-- follow the same INSERT pattern. The complete question data is maintained in
-- client/src/data/questions.js as fallback seed data.
--
-- For a full production deployment, run the seed script:
--   node scripts/seed-questions.js
-- which reads from questions.js and inserts all questions into Supabase.
--
-- The client application uses questions.js as a fallback when Supabase is
-- unavailable, so the quiz works fully offline without this seed data.

-- ============================================
-- NOTE ON QUESTION SEEDING STRATEGY
-- ============================================
-- The complete question bank (30+ questions) with all scoring values is
-- defined in client/src/data/questions.js. This file serves as:
-- 1. The source of truth for question content
-- 2. A fallback when Supabase is unavailable
-- 3. The seed source for the database
--
-- To seed all questions programmatically, use the admin dashboard's
-- question editor or the API endpoint. The frontend will automatically
-- use the local data if the database hasn't been seeded yet.
