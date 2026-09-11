/*
# Create expert_demandes and experts tables for real-time admin management

1. New Tables
- `expert_demandes`: stores inscription requests submitted from the DevenirExpert form.
  - id (uuid, PK, default gen_random_uuid)
  - nom (text, not null)
  - pays (text, not null)
  - whatsapp (text, not null)
  - ville (text, not null)
  - fonction (text, not null)
  - adresse (text, not null)
  - bio (text, not null)
  - cv_name (text, nullable)
  - cv_data (text, nullable - base64 encoded file)
  - status (text, not null, default 'pending' - values: pending, approved, rejected)
  - created_at (timestamptz, default now)

- `experts`: stores approved experts visible on the Experts page.
  - id (uuid, PK, default gen_random_uuid)
  - nom (text, not null)
  - pays (text, not null)
  - whatsapp (text, not null)
  - ville (text, not null)
  - fonction (text, not null)
  - adresse (text, not null)
  - bio (text, not null)
  - photo (text, nullable)
  - status (text, not null, default 'approved')
  - travaux (jsonb, default '[]')
  - prix_jour (text, nullable)
  - code (text, nullable)
  - is_default (boolean, default false)
  - created_at (timestamptz, default now)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD on both tables (single-tenant app, no sign-in).

3. Important Notes
- This is a no-auth app (no sign-in screen), so all policies use TO anon, authenticated.
- The admin "secret" is enforced in the frontend (3 clicks + PIN code Azer2323), not at the database level.
- Real-time subscriptions on these tables will allow the admin to see new demandes instantly.
*/

CREATE TABLE IF NOT EXISTS expert_demandes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  pays text NOT NULL,
  whatsapp text NOT NULL,
  ville text NOT NULL,
  fonction text NOT NULL,
  adresse text NOT NULL,
  bio text NOT NULL,
  cv_name text,
  cv_data text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expert_demandes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_demandes" ON expert_demandes;
CREATE POLICY "anon_select_demandes" ON expert_demandes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_demandes" ON expert_demandes;
CREATE POLICY "anon_insert_demandes" ON expert_demandes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_demandes" ON expert_demandes;
CREATE POLICY "anon_update_demandes" ON expert_demandes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_demandes" ON expert_demandes;
CREATE POLICY "anon_delete_demandes" ON expert_demandes FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  pays text NOT NULL,
  whatsapp text NOT NULL,
  ville text NOT NULL,
  fonction text NOT NULL,
  adresse text NOT NULL,
  bio text NOT NULL,
  photo text,
  status text NOT NULL DEFAULT 'approved',
  travaux jsonb DEFAULT '[]'::jsonb,
  prix_jour text,
  code text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_experts" ON experts;
CREATE POLICY "anon_select_experts" ON experts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_experts" ON experts;
CREATE POLICY "anon_insert_experts" ON experts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_experts" ON experts;
CREATE POLICY "anon_update_experts" ON experts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_experts" ON experts;
CREATE POLICY "anon_delete_experts" ON experts FOR DELETE
  TO anon, authenticated USING (true);
