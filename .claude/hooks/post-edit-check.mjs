#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit): lints the file Claude just changed and
// validates blog MDX. Problems go straight back to Claude as feedback.
import path from "node:path";
import { existsSync } from "node:fs";
import { readEvent, block, allow, run, projectDir } from "./lib.mjs";

const event = readEvent();
const filePath = String(event?.tool_input?.file_path ?? "");
if (!filePath) allow();

const root = projectDir();
const abs = path.resolve(root, filePath);
const rel = path.relative(root, abs).split(path.sep).join("/");
if (rel.startsWith("../") || !existsSync(abs)) allow();

if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(rel) && !rel.startsWith(".claude/")) {
  const res = run("npx", ["--no-install", "eslint", "--no-warn-ignored", "--max-warnings=-1", rel], { cwd: root });
  if (res.code !== 0) {
    block(`ESLint found problems in ${rel}. Fix them before moving on:\n${res.out.slice(0, 4000)}`);
  }
}

if (/^content\/blog\/.+\.mdx?$/.test(rel)) {
  const res = run("node", ["scripts/validate-content.mjs"], { cwd: root });
  if (res.code !== 0) {
    block(`Blog content validation failed after editing ${rel}:\n${res.out.slice(0, 4000)}`);
  }
}

allow();
