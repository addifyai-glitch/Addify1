#!/usr/bin/env node
// Runs the real discriminatory-language guard (lib/discriminatory-language-guard.mjs
// — the exact same pattern list used by the app routes) against every live
// job in Supabase, directly via the REST API with the service role key.
//
// This exists specifically to catch writes that bypass the app layer
// entirely (a direct REST API call, a SQL editor edit, a future script) —
// the app-route guards can only see traffic that goes through them. See
// the trade-off writeup in the PR this shipped with for why this is a
// scheduled check rather than a Postgres trigger.
//
// FAILS LOUDLY (non-zero exit) if anything is found, so a direct-write
// bypass surfaces within a week via a red GitHub Actions run, not silently.
// Run with: node scripts/check-discriminatory-language-live.mjs
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.

import { checkJobForDiscriminatoryLanguage } from '../lib/discriminatory-language-guard.mjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY in the environment.');
  console.error('   This check needs both as repo secrets to run in CI.');
  process.exit(1);
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?select=*`, {
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  },
});

if (!res.ok) {
  console.error(`❌ Failed to fetch jobs from Supabase: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const jobs = await res.json();
console.log(`Checked ${jobs.length} live jobs against the discriminatory-language guard.`);

let flaggedCount = 0;
for (const job of jobs) {
  const matches = checkJobForDiscriminatoryLanguage(job);
  if (matches.length === 0) continue;
  flaggedCount++;
  console.error(`\n[FLAGGED] job "${job.slug || job.title}" (id=${job.id}):`);
  for (const m of matches) {
    console.error(`  field=${m.field} pattern="${m.label}" matched="${m.matchedText}" context="...${m.context}..."`);
  }
}

if (flaggedCount > 0) {
  console.error(`\n❌ ${flaggedCount} of ${jobs.length} live jobs flagged. Review above — this means content reached the live table without going through the app's own guard (a direct write), or flagged_reasons wasn't set for some other reason.`);
  process.exit(1);
}

console.log('✅ No discriminatory-language matches found in live jobs.');
