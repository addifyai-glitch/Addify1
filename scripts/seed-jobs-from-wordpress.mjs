#!/usr/bin/env node
// Seed Supabase jobs table from data/migration-jobs.json
// Run with: node scripts/seed-jobs-from-wordpress.mjs
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (not the anon key)

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { warnIfDiscriminatoryLanguage } from '../lib/discriminatory-language-guard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing env vars in .env.local');
  console.error('   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Service role key: Supabase Dashboard > Settings > API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const dataPath = path.join(__dirname, '..', 'data', 'migration-jobs.json');
const jobs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
console.log(`Loaded ${jobs.length} jobs from migration-jobs.json`);

const rows = jobs.map((j) => ({
  wp_id: j.wp_id,
  slug: j.slug,
  title: j.title,
  company: j.company || null,
  description: j.description,
  category: j.category,
  sector: j.sector || null,
  employment_type: j.employment_type,
  experience_level: j.experience_level,
  experience_label: j.experience_label || null,
  qualification: j.qualification || null,
  country: j.country,
  city: j.city,
  address: j.address || null,
  salary_min: j.salary_min,
  salary_max: j.salary_max,
  currency: j.currency,
  apply_url: j.apply_url,
  apply_type: j.apply_type || null,
  is_featured: j.is_featured,
  is_filled: j.is_filled,
  approved: true,
  source: 'wordpress_migration',
  posted_at: j.posted_at,
  modified_at: j.modified_at || null,
  expires_at: null,
}));

// Ingest-time check, not a post-hoc audit — every row gets checked before
// it's ever written. Warns and logs context only; never strips or blocks.
let flaggedCount = 0;
for (const row of rows) {
  const matches = warnIfDiscriminatoryLanguage(row, 'wordpress_migration');
  if (matches.length > 0) flaggedCount++;
}
if (flaggedCount > 0) {
  console.warn(`⚠️  ${flaggedCount} of ${rows.length} jobs flagged for review above. Import will continue.`);
}

console.log(`Inserting ${rows.length} jobs...`);

const { data, error } = await supabase
  .from('jobs')
  .upsert(rows, { onConflict: 'slug', ignoreDuplicates: false })
  .select('id, slug');

if (error) {
  console.error('❌ Insert failed:', error.message);
  process.exit(1);
}

console.log(`✅ Successfully seeded ${data.length} jobs`);
console.log('First 5:', data.slice(0, 5).map((d) => d.slug).join(', '));
