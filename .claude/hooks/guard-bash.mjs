#!/usr/bin/env node
// PreToolUse (Bash): blocks commands that could damage production, history or
// secrets. Everything else falls through to the normal permission flow.
import { readEvent, block, allow, run, projectDir } from "./lib.mjs";

const event = readEvent();
const cmd = String(event?.tool_input?.command ?? "");
if (!cmd.trim()) allow();

// Normalise whitespace so "git   push" can't slip past a pattern.
const c = cmd.replace(/\s+/g, " ");

const currentBranch = () =>
  run("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: projectDir() }).out;

const rules = [
  [/\bgit push\b.*(\s--force\b|\s-f\b|\s--force-with-lease\b|\s\+\S)/, "Force-push is not allowed."],
  [/\bgit push\b.*\b(main|master)\b/, "Never push to main. Push your feature branch and open a pull request."],
  [/\bgit reset --hard\b/, "git reset --hard discards work. Ask the founder first."],
  [/\bgit clean -[a-z]*f/, "git clean -f deletes untracked files. Ask the founder first."],
  [/\bgit branch -D\b/, "Deleting branches with -D is not allowed."],
  [/\bgh pr merge\b/, "Merging is the founder's decision (merge gate). Open or update the PR instead."],
  [/\bgh (repo|secret|variable) (delete|set|remove)\b/, "Changing repo settings or secrets is not allowed from an agent session."],
  [/\bsupabase (db (reset|push)|migration repair)\b/, "Database resets and pushes run only through a reviewed migration PR."],
  [/\b(DROP|TRUNCATE) (TABLE|SCHEMA|DATABASE)\b/i, "Destructive SQL is not allowed from an agent session."],
  [/\bnpm publish\b/, "Publishing packages is not allowed."],
  [/(^|[\s;&|(])(printenv|env)\s*($|\||>)/, "Dumping environment variables can leak secrets."],
  [/(^|[\s;&|])(cat|less|more|head|tail|bat|nl|cp|mv|grep|rg|sed|awk)\b[^|;&]*\.env(?!\.example)(\.[\w.-]+)?\b/, "Never read or copy .env files. Use .env.example for variable names."],
  [/\bcurl\b.*-H\s*["']?(Authorization|apikey|x-api-key)/i, "Requests with auth headers must not run from an agent session."],
  [/\b(coolify|hcloud)\b/, "Infrastructure CLIs are off-limits; production changes go through merge to main."],
];

for (const [re, msg] of rules) {
  if (re.test(c)) block(`Blocked by guard-bash: ${msg}`);
}

// rm -r / rm -rf: allow only build artefacts.
const rm = c.match(/\brm\s+(-[a-zA-Z]*r[a-zA-Z]*|--recursive)\b(.*)/);
if (rm) {
  const SAFE = new Set([".next", "node_modules", "coverage", "out", "test-results", "playwright-report"]);
  const targets = rm[2]
    .split(/[;&|]/)[0]
    .split(" ")
    .filter((t) => t && !t.startsWith("-"))
    .map((t) => t.replace(/^\.\//, "").replace(/\/$/, ""));
  if (targets.length === 0 || targets.some((t) => !SAFE.has(t))) {
    block(`Blocked by guard-bash: recursive delete is only allowed for ${[...SAFE].join(", ")}.`);
  }
}

// Commits and bare pushes while sitting on main.
if (/\bgit (commit|push|merge|rebase)\b/.test(c) && /^(main|master)$/.test(currentBranch())) {
  block("Blocked by guard-bash: you are on main. Create a branch first, e.g. `git checkout -b feat/<name>`.");
}

allow();
