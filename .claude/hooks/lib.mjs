// Shared helpers for Claude Code hooks. Hooks receive a JSON event on stdin.
// Exit code 2 = block the action (PreToolUse) or send feedback to Claude
// (PostToolUse / Stop); the message on stderr tells Claude why.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

export function readEvent() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

export function block(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

export function allow() {
  process.exit(0);
}

export function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: "utf8", ...opts });
  return {
    code: res.status ?? 1,
    out: `${res.stdout ?? ""}${res.stderr ?? ""}`.trim(),
  };
}

export function projectDir() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

// Set ADDIFY_ALLOW_PROTECTED=1 when starting Claude Code for a session whose
// task is explicitly to change workflows, hooks or settings.
export const protectedOverride = process.env.ADDIFY_ALLOW_PROTECTED === "1";
