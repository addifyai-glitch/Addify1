-- Nullable column, populated only when the discriminatory-language guard
-- (lib/discriminatory-language-guard.mjs) fires at write time. Existing
-- rows stay null — no backfill. Rendered as a warning banner on the
-- submission's card in /admin/submissions.
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS flagged_reasons JSONB;
