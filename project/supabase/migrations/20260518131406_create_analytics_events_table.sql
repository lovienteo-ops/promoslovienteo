/*
  # Analytics Events Table

  Stores all behavioral tracking events from landing pages.

  1. New Tables
    - `analytics_events`
      - `id` (uuid, pk)
      - `type` (text) — pageview, cta_click, section_dwell, scroll_depth, click, rage_click, exit
      - `page` (text) — slug of the landing page
      - `sid` (text) — anonymous session id (client-generated)
      - `ts` (bigint) — unix timestamp ms from client
      - `payload` (jsonb) — all other event-specific fields (section, ms, pct, x_pct, y_pct, label, ref, ua, etc.)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled — only the service role (edge function) can INSERT
    - Authenticated users can SELECT their own data via service role
    - No public read access
*/

CREATE TABLE IF NOT EXISTS analytics_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text        NOT NULL,
  page       text        NOT NULL DEFAULT '',
  sid        text        NOT NULL DEFAULT '',
  ts         bigint      NOT NULL DEFAULT 0,
  payload    jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_ae_page       ON analytics_events (page);
CREATE INDEX IF NOT EXISTS idx_ae_type       ON analytics_events (type);
CREATE INDEX IF NOT EXISTS idx_ae_sid        ON analytics_events (sid);
CREATE INDEX IF NOT EXISTS idx_ae_created_at ON analytics_events (created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Only the service role (used by the edge function) can insert
CREATE POLICY "Service role can insert events"
  ON analytics_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can also select (for dashboards)
CREATE POLICY "Service role can read events"
  ON analytics_events FOR SELECT
  TO service_role
  USING (true);
