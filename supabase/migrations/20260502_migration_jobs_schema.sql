-- Migration: Final jobs table schema for WordPress migration
-- Run this in Supabase Dashboard > SQL Editor before running the seed script.
-- Drops the old jobs table (never went live, no data to preserve).

DROP TABLE IF EXISTS jobs CASCADE;

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wp_id TEXT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  sector TEXT,
  employment_type TEXT NOT NULL DEFAULT 'Full time',
  experience_level TEXT NOT NULL CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Executive')),
  experience_label TEXT,
  qualification TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  currency TEXT,
  apply_url TEXT NOT NULL,
  apply_type TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_filled BOOLEAN NOT NULL DEFAULT false,
  approved BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL CHECK (source IN ('admin', 'user_submission', 'wordpress_migration')),
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX jobs_slug_idx ON jobs(slug);
CREATE INDEX jobs_country_city_idx ON jobs(country, city);
CREATE INDEX jobs_category_idx ON jobs(category);
CREATE INDEX jobs_featured_idx ON jobs(is_featured) WHERE is_featured = true;
CREATE INDEX jobs_active_idx ON jobs(approved, is_filled, posted_at DESC) WHERE approved = true AND is_filled = false;

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active jobs" ON jobs
  FOR SELECT USING (approved = true);

CREATE POLICY "Admin write" ON jobs
  FOR ALL USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
