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

- **Non-Gulf job listings mixed into the Gulf jobs table.** Found
  2026-08-26 while checking whether the 31 stale `wordpress_migration`
  jobs' `apply_url` values still resolve (see the P1.7-followup report for
  the full liveness check). Several of the 14 external apply URLs point to
  job boards with no Gulf connection at all — all still filed under
  `country: UAE` or similar:

  - `sales-manager-mainosherva-oy-click-human-resources-oy-pirkkala` ->
    `tyomarkkinatori.fi` (Finnish national job bank)
  - `technical-writer-technical-writer-to-medtech-company-in-uppsala` ->
    `arbetsformedlingen.se` (Swedish employment agency); title says
    "Uppsala" (a Swedish city)
  - `temporary-position-educational-manager-preschool-teacher-kindergarten-teacher`
    -> `arbeidsplassen.nav.no` (Norwegian employment agency)
  - `customer-support-representative-2` -> `sdworxprofessionals.be`
    (Belgian HR platform)
  - `corporate-intelligence-compliance` -> `arendt.com` (Luxembourg law
    firm)

  Combined with the `(m/f/d)` finding above, this points to the same root
  cause: the WordPress-era job import mixed in content from an
  international/multi-market job feed without a country filter. Likely
  more mis-filed non-Gulf jobs exist beyond the ones found incidentally
  here — worth an exhaustive pass, not just spot-checking.
