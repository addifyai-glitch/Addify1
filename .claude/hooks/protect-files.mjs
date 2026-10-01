#!/usr/bin/env node
// PreToolUse (Edit|Write|MultiEdit|NotebookEdit): keeps agents away from
// secrets, applied migrations, CI and the guardrails themselves.
import path from "node:path";
import { readEvent, block, allow, run, projectDir, protectedOverride } from "./lib.mjs";

const event = readEvent();
const filePath = String(event?.tool_input?.file_path ?? event?.tool_input?.notebook_path ?? "");
if (!filePath) allow();

const root = projectDir();
const rel = path.relative(root, path.resolve(root, filePath)).split(path.sep).join("/");
const base = path.basename(rel);

// Secrets: always blocked, no override.
if (/^\.env(\..+)?$/.test(base) && base !== ".env.example") {
  block("Blocked by protect-files: .env files hold secrets and must never be written by an agent.");
}
if (/\.(pem|key|p12)$/.test(base)) {
  block("Blocked by protect-files: key and certificate files must never be written by an agent.");
}

// Outside the repo.
if (rel.startsWith("../")) {
  block(`Blocked by protect-files: ${filePath} is outside the project.`);
}

if (protectedOverride) allow();

// Applied migrations are history: add a new migration instead.
if (rel.startsWith("supabase/migrations/")) {
  const tracked = run("git", ["ls-files", "--error-unmatch", rel], { cwd: root }).code === 0;
  if (tracked) {
    block("Blocked by protect-files: this migration is already committed. Add a new migration file instead of editing it.");
  }
}

const GUARDED = [
  [/^\.github\/workflows\//, "CI workflows"],
  [/^\.claude\/(settings\.json|hooks\/)/, "Claude guardrails"],
  [/^CLAUDE\.md$/, "project rules"],
  [/^package-lock\.json$/, "the lockfile (use npm install instead)"],
];
for (const [re, label] of GUARDED) {
  if (re.test(rel)) {
    block(
      `Blocked by protect-files: ${rel} is part of ${label}. Describe the change in the PR for the founder, ` +
        "or the founder can restart Claude Code with ADDIFY_ALLOW_PROTECTED=1 for a session that is explicitly about this."
    );
  }
}

allow();
