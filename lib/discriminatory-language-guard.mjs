// Ingest-time check for discriminatory hiring language in free-text job
// fields (nationality/gender/religion/age/visa-status requirements —
// illegal or against policy to publish, but common in raw WordPress-era
// and third-party job feeds).
//
// WARNS ONLY. Never auto-strips. The August 2026 sweep of all 52 live
// jobs found real hits alongside several false positives that a blind
// auto-fixer would have wrongly "fixed":
//   - "Arab" inside "United Arab Emirates" (address field)
//   - "Attractive earning opportunities" (describes pay, not appearance)
//   - "(m/f/d)" in job titles — the standard German/Swiss equal-opportunity
//     notation, LEGALLY REQUIRED on job ads in that market. An auto-fixer
//     would have stripped a compliance marker while thinking it was
//     removing discrimination.
// A human has to read the context and decide. This module's job is to
// surface candidates, not to touch data.
//
// Plain ESM (.mjs, no TypeScript) so it can be imported unmodified by
// both the Next.js app (via webpack/SWC, which handles .mjs imports from
// .ts fine) and the standalone migration script under plain `node`,
// which has no TypeScript loader available.

// Indian/Pakistani are common Gulf job-content words with zero discriminatory
// intent most of the time — "Indian High School Dubai", "Indian curriculum",
// "Indian restaurant", "Indian cuisine chef" are all ordinary job titles/
// employer names, not hiring criteria. A bare word match on these two terms
// specifically would drown the guard in noise on a UAE-heavy jobs table.
// So: only flag them when a hiring-criteria signal word appears within a
// short window on either side — which is exactly the shape of the real
// violation this guard exists to catch ("Female Indian as repair
// division..." — the signal word sits right next to the nationality word).
// Filipino/Filipina keep the plain bare-word match (that was the original,
// explicitly-specified list — not narrowed here since it wasn't flagged as
// noisy).
const HIRING_SIGNAL_WINDOW_CHARS = 40;
const HIRING_SIGNAL_PATTERN =
  /\b(?:male|female|man|woman|ladies|gents?|gentlemen|only|preferred|candidates?|applicants?|nationality|must\s+be|required)\b/i;

function hasNearbyHiringSignal(value, index, length) {
  const start = Math.max(0, index - HIRING_SIGNAL_WINDOW_CHARS);
  const end = Math.min(value.length, index + length + HIRING_SIGNAL_WINDOW_CHARS);
  return HIRING_SIGNAL_PATTERN.test(value.slice(start, end));
}

export const DISCRIMINATORY_PATTERNS = [
  { label: "nationality", pattern: /\bnationalit(?:y|ies)\b/i },
  { label: "nationals only", pattern: /\bnationals?\s+only\b/i },
  { label: "country nationals", pattern: /\b(?:GCC|UAE|Saudi|Emirati|Arab)\s+nationals?\b/i },
  { label: "Indian", pattern: /\bIndian\b/i, requiresNearbySignal: true },
  { label: "Filipino/Filipina", pattern: /\bFilipin[oa]\b/i },
  { label: "Pakistani", pattern: /\bPakistani\b/i, requiresNearbySignal: true },
  { label: "Arab nationals", pattern: /\bArab\s+nationals?\b/i },
  { label: "Western educated", pattern: /\bWestern\s+educated\b/i },
  { label: "males only", pattern: /\bmales?\s+only\b/i },
  { label: "female only", pattern: /\bfemales?\s+only\b/i },
  { label: "female candidates", pattern: /\bfemale\s+candidates?\b/i },
  { label: "ladies", pattern: /\bladies\b/i },
  { label: "gents", pattern: /\bgents\b/i },
  { label: "gentleman", pattern: /\bgentlem[ae]n\b/i },
  { label: "age limit", pattern: /\bage\s+limit\b/i },
  { label: "age between", pattern: /\bage\s+between\b/i },
  { label: "below age N", pattern: /\bbelow\s+\d{2}\b/i },
  { label: "under age N", pattern: /\bunder\s+\d{2}\b/i },
  { label: "must be single", pattern: /\bmust\s+be\s+single\b/i },
  { label: "married preferred", pattern: /\bmarried\s+preferred\b/i },
  { label: "no visa", pattern: /\bno\s+visa\b/i },
  { label: "own visa", pattern: /\bown\s+visa\b/i },
  { label: "husband visa", pattern: /\bhusband(?:'s)?\s+visa\b/i },
  { label: "father visa", pattern: /\bfather(?:'s)?\s+visa\b/i },
  { label: "sponsor visa", pattern: /\bsponsor\s+visa\b/i },
  { label: "Muslim", pattern: /\bMuslim\b/i },
  { label: "Christian", pattern: /\bChristian\b/i },
  { label: "Hindu", pattern: /\bHindu\b/i },
  { label: "Arabic speaking preferred", pattern: /\bArabic\s+speaking\s+preferred\b/i },
  { label: "native Arabic", pattern: /\bnative\s+Arabic\b/i },
];

// Genuine free-text fields only. Deliberately excludes address, country,
// city, currency, category, experience_level, source, apply_url,
// submitter_email, submitter_ip_hash, wp_id — controlled/structural
// fields where the sweep found only false positives.
export const CHECKED_FIELDS = [
  "title",
  "description",
  "qualification",
  "company",
  "sector",
  "employment_type",
  "experience_label",
  "apply_type",
  "slug",
];

export function checkJobForDiscriminatoryLanguage(job) {
  const matches = [];
  for (const field of CHECKED_FIELDS) {
    const value = job[field];
    if (!value || typeof value !== "string") continue;
    for (const { label, pattern, requiresNearbySignal } of DISCRIMINATORY_PATTERNS) {
      // Force the global flag so every occurrence is checked, not just the
      // first — matters for requiresNearbySignal patterns: a field can
      // mention "Indian" once with no signal nearby (skip) and again later
      // with one (flag), and only checking the first occurrence would miss
      // the real one if it isn't first.
      const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
      const re = new RegExp(pattern.source, flags);
      for (const m of value.matchAll(re)) {
        if (requiresNearbySignal && !hasNearbyHiringSignal(value, m.index, m[0].length)) {
          continue;
        }
        const start = Math.max(0, m.index - 30);
        const end = Math.min(value.length, m.index + m[0].length + 30);
        matches.push({
          field,
          label,
          matchedText: m[0],
          context: value.slice(start, end).replace(/\s+/g, " ").trim(),
        });
      }
    }
  }
  return matches;
}

// Logs a warning (never throws, never blocks the caller) and returns the
// matches so the caller can also surface them elsewhere (admin UI, etc.)
// if it wants to.
export function warnIfDiscriminatoryLanguage(job, sourceLabel) {
  const matches = checkJobForDiscriminatoryLanguage(job);
  if (matches.length === 0) return matches;

  const who = job.slug || job.title || "(untitled)";
  console.warn(
    `[discriminatory-language-guard]${sourceLabel ? ` [${sourceLabel}]` : ""} ` +
    `job "${who}" — ${matches.length} potential match(es), review before publishing:`
  );
  for (const m of matches) {
    console.warn(
      `  field=${m.field} pattern="${m.label}" matched="${m.matchedText}" context="...${m.context}..."`
    );
  }
  return matches;
}
