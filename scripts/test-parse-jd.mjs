// Run: node scripts/test-parse-jd.mjs
// Node 24 runs the .ts module directly (type stripping). No test framework in
// this repo, so this is a plain assert script. All fixture text is fictional.
import assert from "node:assert/strict";
import { parseJobDescription, htmlToStructuredText } from "../lib/cover-letter/parse-jd.ts";

// The reported failure: "*" bullets, orphaned "*" on their own lines, sections
// in the order Benefits-style content sits in real ads.
const STAR_AD = `Procurement Analyst

**About Crestline Foods**
Crestline Foods is a fictional regional distributor used only in this test.

**Responsibilities**
* Own supplier pricing across three Gulf markets
*
* Run the weekly price review with category managers
* Prepare the quarterly report
   for the finance director
*

**Requirements**
* 4+ years in procurement or category analysis
* Advanced Excel
- Comfortable presenting to senior stakeholders

BENEFITS
• Health insurance
•Annual flight ticket
1. Housing allowance
2) 30 days annual leave
*
*
`;

const r = parseJobDescription(STAR_AD);
assert.equal(r.ok, true, "star ad should parse");
const flat = JSON.stringify(r.blocks);
assert.ok(!flat.includes('"*"'), "no orphan * survives");
for (const b of r.blocks) {
  if (b.type === "list") for (const i of b.items) assert.ok(i.trim().length > 0 && !/^[*\-•]/.test(i), `bad item: ${i}`);
}
const headings = r.blocks.filter((b) => b.type === "heading").map((b) => b.text);
assert.deepEqual(headings, ["About Crestline Foods", "Responsibilities", "Requirements", "BENEFITS"], "section order preserved");
const resp = r.blocks[r.blocks.findIndex((b) => b.type === "heading" && b.text === "Responsibilities") + 1];
assert.equal(resp.items.length, 3, "empty item stripped, wrapped line rejoined");
assert.match(resp.items[2], /Prepare the quarterly report for the finance director/);
const reqList = r.blocks[r.blocks.findIndex((b) => b.type === "heading" && b.text === "Requirements") + 1];
assert.equal(reqList.items.length, 3, "* and - bullets share one list");

// Orphan marker followed by its text on the next line.
const o = parseJobDescription("Duties\n*\nLead the team\n*\nHire two analysts");
assert.equal(o.ok, true);
assert.deepEqual(o.blocks[1], { type: "list", ordered: false, items: ["Lead the team", "Hire two analysts"] });

// "**bold**" and "-5%" and "+971" must not be treated as bullets.
const n = parseJobDescription("Salary is -5% vs last year\n+971 4 000 0000 for enquiries");
assert.equal(n.ok, true);
assert.equal(n.blocks.every((b) => b.type !== "list"), true);

// Numbered lists stay ordered.
const num = parseJobDescription("1. First\n2. Second\n3) Third");
assert.deepEqual(num.blocks, [{ type: "list", ordered: true, items: ["First", "Second", "Third"] }]);

// Flattened one-liner (what a scraped page used to look like).
const flat1 = parseJobDescription("Responsibilities: * Lead pricing * Run reviews * Write reports");
assert.equal(flat1.ok, true);
assert.equal(flat1.blocks.find((b) => b.type === "list").items.length, 3);

// Empty / whitespace / only markers → not ok, caller shows nothing or raw.
assert.equal(parseJobDescription("   \n ").ok, false);
assert.equal(parseJobDescription("*\n*\n- \n").ok, false);

// Arabic content survives (letters invariant is Unicode-aware).
const ar = parseJobDescription("المسؤوليات\n* إدارة الموردين\n* إعداد التقارير");
assert.equal(ar.ok, true);

// HTML path: order kept, li → bullets, nav/footer dropped.
const html = `<nav>Home Jobs Login</nav><h1>Procurement Analyst</h1>
<h2>Responsibilities</h2><ul><li>Own supplier pricing</li><li>Run weekly reviews</li></ul>
<h2>Requirements</h2><ul><li>4+ years&nbsp;experience</li><li>Advanced Excel</li></ul>
<h2>Benefits</h2><ul><li>Health insurance</li><li>Flight ticket</li></ul><footer>Cookie policy</footer>`;
const text = htmlToStructuredText(html);
assert.ok(!/Login|Cookie/.test(text), "nav/footer removed");
const parsedHtml = parseJobDescription(text);
assert.equal(parsedHtml.ok, true);
assert.deepEqual(
  parsedHtml.blocks.filter((b) => b.type === "heading").map((b) => b.text),
  ["Procurement Analyst", "Responsibilities", "Requirements", "Benefits"]
);

console.log("parse-jd: all assertions passed");
console.log("\n--- BEFORE (raw pasted text shown as-is) ---\n" + STAR_AD);
console.log("--- AFTER (parsed blocks) ---");
for (const b of r.blocks) {
  if (b.type === "list") console.log((b.ordered ? "ol" : "ul") + ":\n" + b.items.map((i, k) => `  ${b.ordered ? k + 1 + "." : "•"} ${i}`).join("\n"));
  else console.log(`${b.type}: ${b.text}`);
}
