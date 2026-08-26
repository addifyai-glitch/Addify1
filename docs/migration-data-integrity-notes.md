# Migration data-integrity notes

Running list of data-quality issues found in the WordPress-migrated `jobs`
records (source: `wordpress_migration`), logged as they're found so they can
get one consolidated cleanup pass later rather than being fixed piecemeal.
Not urgent, not user-facing harm — just wrong metadata.

## Open

- **Country/city miscategorization: Swiss/German jobs filed as UAE/Dubai.**
  Found 2026-08-25 while cross-referencing the Supabase/JSON job sets during
  a discriminatory-language sweep. At least 4 records carry the German/Swiss
  `(m/f/d)` or `(f/m/d)` equal-opportunity notation in their title — a
  notation that only makes sense for a DACH-region job ad (it's the
  standard, legally required gender-neutral hiring marker in Germany/
  Switzerland/Austria) — yet all 4 are stored with `country: UAE`,
  `city: Dubai`:

  - `sanitary-installer-efz-m-f-d-wanted-in-brugg` — title mentions "Brugg"
    (a town in Switzerland) explicitly; "EFZ" is a Swiss vocational
    certification abbreviation.
  - `production-technician-polishing-m-f-d-metalworker-metal-design`
  - `creative-digital-designer-m-f-d-1784203604204`
  - `graphic-designer-f-m-d-1784203984334`

  Likely cause: these look like a generic international job feed (possibly
  aggregated from multiple markets) that got imported into this Gulf-only
  jobs table without a country filter, or a WordPress migration script that
  defaulted country/city when the source data didn't map cleanly.

  Not fixed as part of this pass — logged for a later, single cleanup pass
  across all WordPress-migration records to check for other
  country/city mismatches beyond just this `(m/f/d)` pattern (this was
  found incidentally, not from an exhaustive check).
