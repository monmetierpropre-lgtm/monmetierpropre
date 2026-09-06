/*
# Create file_pricing and app_settings tables

1. New Tables
- `file_pricing`: Stores pricing config for each downloadable file (CV, lettre, plan, etc.)
  - id (uuid PK)
  - file_id (text, unique) - matches the template id in the app (e.g. "cv-simple-gratuit")
  - file_type (text) - category: "cv", "lettre", "plan", "carte", "affiche", "outil"
  - is_paid (boolean, default false) - whether the file requires payment
  - price (text) - price label (e.g. "5$" or "1000 CDF")
  - payment_code (text) - pasted payment embed/redirect code (Stripe, Airtel Money, M-Pesa, FlexPay)
  - created_at, updated_at
- `app_settings`: Stores admin-editable texts (accueil buttons, regles text, annonce)
  - id (uuid PK)
  - key (text, unique) - setting key (e.g. "accueil_buttons", "regles_text", "annonce")
  - value (jsonb) - the setting value
  - updated_at

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated full CRUD (single-tenant app, no sign-in screen, data is intentionally public/shared).
*/

CREATE TABLE IF NOT EXISTS file_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id text UNIQUE NOT NULL,
  file_type text NOT NULL DEFAULT 'cv',
  is_paid boolean NOT NULL DEFAULT false,
  price text,
  payment_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE file_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_file_pricing" ON file_pricing;
CREATE POLICY "anon_select_file_pricing" ON file_pricing FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_file_pricing" ON file_pricing;
CREATE POLICY "anon_insert_file_pricing" ON file_pricing FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_file_pricing" ON file_pricing;
CREATE POLICY "anon_update_file_pricing" ON file_pricing FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_file_pricing" ON file_pricing;
CREATE POLICY "anon_delete_file_pricing" ON file_pricing FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_settings" ON app_settings;
CREATE POLICY "anon_insert_app_settings" ON app_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_settings" ON app_settings;
CREATE POLICY "anon_update_app_settings" ON app_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_app_settings" ON app_settings;
CREATE POLICY "anon_delete_app_settings" ON app_settings FOR DELETE
  TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'file_pricing'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE file_pricing;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;
  END IF;
END
$$;
