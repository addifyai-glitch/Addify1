#!/usr/bin/env node
// Stop: Claude may not report "done" while the project has type errors.
// Runs only when TypeScript files changed, and never loops: if Claude is
// already continuing because of this hook, it lets the stop through.
import { readEvent, block, allow, run, projectDir } from "./lib.mjs";

const event = readEvent();
if (event?.stop_hook_active) allow();

const root = projectDir();
const status = run("git", ["status", "--porcelain"], { cwd: root });
if (status.code !== 0) allow();

const changedTs = status.out
  .split("\n")
  .map((l) => l.slice(3).trim())
  .some((f) => /\.(ts|tsx)$/.test(f));
if (!changedTs) allow();

const res = run("npx", ["--no-install", "tsc", "--noEmit", "--pretty", "false"], { cwd: root });
if (res.code !== 0) {
  const lines = res.out.split("\n").slice(0, 40).join("\n");
  block(`Type check failed. Fix these before finishing:\n${lines}`);
}

allow();
