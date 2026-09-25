// Job description parsing for the cover-letter tool's Step 2.
//
// Pure functions, no path aliases, so they can run in the browser, in a route
// handler, and under plain `node` for tests (scripts/test-parse-jd.mts).
//
// Two jobs:
//   1. htmlToStructuredText: turn a fetched job page into text that keeps
//      line breaks and list items (the old version flattened everything onto
//      one line, which is what scrambled section order).
//   2. parseJobDescription: turn pasted or fetched text into ordered blocks
//      (headings, paragraphs, lists), handling *, -, bullets and numbered
//      lists, orphaned markers, and empty items.
//
// The parser is lossless by contract: the letters in the output, in order,
// must equal the letters in the input. Anything else means the parse is
// wrong, and the caller shows the raw text instead of a mangled version.

export type JdBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

export type ParsedJd =
  | { ok: true; blocks: JdBlock[] }
  | { ok: false; reason: "empty" | "not-lossless"; raw: string };

// ─── HTML → text ─────────────────────────────────────────────────────────────

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  ndash: "–",
  mdash: "—",
  bull: "•",
  middot: "·",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => safeCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => safeCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

function safeCodePoint(n: number): string {
  try {
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
  } catch {
    return "";
  }
}

export function htmlToStructuredText(html: string): string {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|svg|nav|footer|aside|form|iframe|template)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n**$1**\n") // keep headings as headings
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|section|article|ul|ol|h[1-6]|tr|table|blockquote)>/gi, "\n")
    .replace(/<(p|div|section|article|ul|ol|h[1-6]|tr|table|blockquote)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeEntities(text)
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Text → blocks ───────────────────────────────────────────────────────────

// Symbol bullets need no trailing space ("•Item" is common in pasted PDFs).
const SYMBOL_BULLET = /^\s*[•·▪▫◦‣►➢✓✔]\s*(\S.*)$/u;
// "*", "-", en/em dash and "+" only count as bullets when followed by a space,
// so "**bold**", "-5%" and "+971 50 ..." are left alone.
const SPACED_BULLET = /^\s*[*\-–—+]\s+(\S.*)$/u;
const NUMBERED = /^\s*\d{1,2}[.)]\s+(\S.*)$/u;
// A marker with nothing after it: the "orphaned *" case. It borrows the next
// non-empty line, or is dropped if there isn't one.
const ORPHAN_MARKER = /^\s*(?:[*\-•·▪▫◦‣►➢✓✔–—+]|\d{1,2}[.)])\s*$/u;

const KNOWN_HEADING =
  /^(about (us|the (role|company|team|job|position))|(key )?responsibilities|requirements|(minimum )?qualifications|benefits|(what|why) (we offer|join us)|what you(’|')?ll (do|bring|need)|who you are|the role|job (description|summary)|(required |preferred )?skills|(nice|good) to have|must have|perks|compensation)\s*:?$/i;

function hasContent(s: string): boolean {
  return /[\p{L}\p{N}]/u.test(s);
}

function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|\s)\*(\S(?:[^*]*?\S)?)\*(?=\s|$|[.,:;!?])/g, "$1$2")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Separators like "Responsibilities: * Lead X * Do Y" (a page that was
// flattened onto one line) become separate bullet lines.
function explodeInlineBullets(line: string): string[] {
  const parts = line.split(/\s+[•▪◦‣]\s+|\s+\*\s+/u);
  if (parts.length < 3) return [line];
  const [head, ...rest] = parts;
  const out: string[] = [];
  if (head.trim()) out.push(head.trim());
  for (const p of rest) out.push(`• ${p}`);
  return out;
}

type Line =
  | { kind: "blank" }
  | { kind: "bullet"; ordered: boolean; text: string }
  | { kind: "orphan" }
  | { kind: "text"; text: string; boldWrapped: boolean };

function classify(raw: string): Line {
  if (!raw.trim()) return { kind: "blank" };
  if (ORPHAN_MARKER.test(raw)) return { kind: "orphan" };

  let m = raw.match(NUMBERED);
  if (m) return { kind: "bullet", ordered: true, text: m[1] };
  m = raw.match(SYMBOL_BULLET) ?? raw.match(SPACED_BULLET);
  if (m) return { kind: "bullet", ordered: false, text: m[1] };

  const boldWrapped = /^\s*(\*\*|__)(.+?)\1\s*:?\s*$/.test(raw);
  return { kind: "text", text: raw.trim(), boldWrapped };
}

function isHeading(text: string, boldWrapped: boolean): boolean {
  if (boldWrapped) return true;
  const words = text.split(/\s+/).length;
  if (KNOWN_HEADING.test(text)) return true;
  if (text.endsWith(":") && text.length <= 70 && words <= 8) return true;
  const letters = text.replace(/[^\p{L}]/gu, "");
  return (
    letters.length >= 3 &&
    text.length <= 60 &&
    words <= 8 &&
    letters === letters.toUpperCase() &&
    letters !== letters.toLowerCase()
  );
}

function lettersOf(s: string): string {
  return s.replace(/[^\p{L}]/gu, "");
}

function blocksLetters(blocks: JdBlock[]): string {
  return blocks
    .map((b) =>
      b.type === "list" ? b.items.map(lettersOf).join("") : lettersOf(b.text)
    )
    .join("");
}

export function parseJobDescription(input: string): ParsedJd {
  const raw = input ?? "";
  if (!raw.trim()) return { ok: false, reason: "empty", raw };

  const normalised = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\t/g, " ");

  const lines = normalised.split("\n").flatMap(explodeInlineBullets).map(classify);

  const blocks: JdBlock[] = [];
  let pendingOrphan = false;
  let prevWasBlank = true;

  const pushItem = (ordered: boolean, text: string) => {
    const clean = stripInline(text);
    if (!hasContent(clean)) return; // strip empty list items
    const last = blocks[blocks.length - 1];
    if (last && last.type === "list" && last.ordered === ordered) {
      last.items.push(clean);
    } else {
      blocks.push({ type: "list", ordered, items: [clean] });
    }
  };

  for (const line of lines) {
    if (line.kind === "blank") {
      pendingOrphan = false; // a marker never reaches across a blank line
      prevWasBlank = true;
      continue;
    }
    if (line.kind === "orphan") {
      pendingOrphan = true;
      prevWasBlank = false;
      continue;
    }
    if (line.kind === "bullet") {
      pendingOrphan = false;
      pushItem(line.ordered, line.text);
      prevWasBlank = false;
      continue;
    }

    // Plain text line.
    const text = stripInline(line.text);
    if (!hasContent(text)) {
      prevWasBlank = false;
      continue;
    }
    if (pendingOrphan && !isHeading(text, line.boldWrapped)) {
      // "*" on its own line, real text on the next: they belong together.
      pendingOrphan = false;
      pushItem(false, text);
      prevWasBlank = false;
      continue;
    }

    pendingOrphan = false;
    const last = blocks[blocks.length - 1];
    const startsLowercase = /^[\p{Ll}(,]/u.test(text);

    // Hard-wrapped continuation of the previous list item or paragraph.
    if (!prevWasBlank && startsLowercase && last) {
      if (last.type === "list") {
        last.items[last.items.length - 1] += ` ${text}`;
        continue;
      }
      if (last.type === "paragraph") {
        last.text += ` ${text}`;
        continue;
      }
    }

    if (isHeading(text, line.boldWrapped)) {
      blocks.push({ type: "heading", text: text.replace(/\s*:$/, "") });
    } else {
      blocks.push({ type: "paragraph", text });
    }
    prevWasBlank = false;
  }

  if (blocks.length === 0) return { ok: false, reason: "empty", raw };

  // Contract: same letters, same order. A mismatch means the parse dropped,
  // duplicated or reordered something, so the caller must show the raw text.
  if (blocksLetters(blocks) !== lettersOf(raw)) {
    return { ok: false, reason: "not-lossless", raw };
  }

  return { ok: true, blocks };
}
