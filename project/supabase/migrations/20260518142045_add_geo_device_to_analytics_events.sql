/*
  # Add geo and device columns to analytics_events

  ## Summary
  Adds dedicated columns for IP address, geolocation data, device info,
  and enriched event metadata to support the new analytics features:
  - Abandonment tracking (users who never clicked buy)
  - Visitor geo/device grids
  - Purchase button click tracking (header vs footer)
  - WhatsApp click tracking

  ## Changes to analytics_events
  - `ip` (text) — visitor IP address captured server-side
  - `country` (text) — country from IP geolocation
  - `city` (text) — city from IP geolocation
  - `region` (text) — region/state from IP geolocation
  - `device_type` (text) — mobile / tablet / desktop
  - `os` (text) — operating system parsed from UA
  - `browser` (text) — browser parsed from UA
  - `ua` (text) — raw user agent string
  - `ref` (text) — referrer URL
  - `btn_position` (text) — 'header' | 'footer' | null — which CTA button was clicked

  ## New indexes
  - ip, country, device_type for fast filtering in grids

  ## Security
  - RLS unchanged (service role only)
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='ip') THEN
    ALTER TABLE analytics_events ADD COLUMN ip text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='country') THEN
    ALTER TABLE analytics_events ADD COLUMN country text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='city') THEN
    ALTER TABLE analytics_events ADD COLUMN city text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='region') THEN
    ALTER TABLE analytics_events ADD COLUMN region text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='device_type') THEN
    ALTER TABLE analytics_events ADD COLUMN device_type text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='os') THEN
    ALTER TABLE analytics_events ADD COLUMN os text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='browser') THEN
    ALTER TABLE analytics_events ADD COLUMN browser text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='ua') THEN
    ALTER TABLE analytics_events ADD COLUMN ua text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='ref') THEN
    ALTER TABLE analytics_events ADD COLUMN ref text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_events' AND column_name='btn_position') THEN
    ALTER TABLE analytics_events ADD COLUMN btn_position text DEFAULT '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ae_ip          ON analytics_events (ip);
CREATE INDEX IF NOT EXISTS idx_ae_country     ON analytics_events (country);
CREATE INDEX IF NOT EXISTS idx_ae_device_type ON analytics_events (device_type);
