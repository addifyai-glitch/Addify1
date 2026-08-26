import { warnIfDiscriminatoryLanguage } from "@/lib/discriminatory-language-guard.mjs";

type JobRow = Record<string, unknown>;

/**
 * Runs the discriminatory-language guard and returns the row to insert/
 * update — with `flagged_reasons` set only when the guard actually fires,
 * per supabase/migrations/20260826_add_jobs_flagged_reasons.sql (nullable,
 * no backfill).
 */
export function buildRowWithFlags(jobRow: JobRow, sourceLabel: string) {
  const matches = warnIfDiscriminatoryLanguage(jobRow, sourceLabel);
  const row = matches.length > 0 ? { ...jobRow, flagged_reasons: matches } : jobRow;
  return { row, matches };
}

/**
 * True when a Supabase/PostgREST error is specifically "flagged_reasons
 * column not found in schema cache" (PGRST204) — meaning the migration
 * above hasn't been applied to this database yet. There is no DDL
 * execution path available to this codebase's own tooling (the service
 * role key only grants PostgREST data-plane access, not ALTER TABLE), so
 * this has to be applied manually via the Supabase SQL editor. Callers
 * should retry the write without `flagged_reasons` rather than fail the
 * whole request — the guard has already logged the flag to the console
 * either way.
 */
export function isMissingFlaggedReasonsColumnError(
  error: { code?: string; message?: string } | null | undefined
): boolean {
  return error?.code === "PGRST204" && /flagged_reasons/i.test(error?.message ?? "");
}
