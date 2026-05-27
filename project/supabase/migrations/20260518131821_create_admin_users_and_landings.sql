/*
  # Admin Panel — Users & Landings Registry

  1. New Tables
    - `admin_users`
      - `id` (uuid, pk)
      - `username` (text, unique)
      - `password_hash` (text) — bcrypt hash
      - `role` (text) default 'superadmin'
      - `created_at` (timestamptz)
    - `landings`
      - `id` (uuid, pk)
      - `slug` (text, unique) — matches analytics_events.page
      - `name` (text) — display name
      - `url` (text) — public URL
      - `active` (bool)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Only service role can read/write (admin edge function handles auth)
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  username      text        UNIQUE NOT NULL,
  password_hash text        NOT NULL,
  role          text        NOT NULL DEFAULT 'superadmin',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on admin_users"
  ON admin_users FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role insert admin_users"
  ON admin_users FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role update admin_users"
  ON admin_users FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Landings registry
CREATE TABLE IF NOT EXISTS landings (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text        UNIQUE NOT NULL,
  name       text        NOT NULL,
  url        text        NOT NULL DEFAULT '',
  active     boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE landings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on landings select"
  ON landings FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role full access on landings insert"
  ON landings FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role full access on landings update"
  ON landings FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed initial landing
INSERT INTO landings (slug, name, url, active)
VALUES (
  'aspiradora-voltra-3en1',
  'Aspiradora Voltra 3en1 Black Edition',
  'https://lovienteopromos.com/aspiradora-voltra-3en1/',
  true
)
ON CONFLICT (slug) DO NOTHING;
