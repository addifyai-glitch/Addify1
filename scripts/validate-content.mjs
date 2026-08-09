#!/usr/bin/env node
// Validates every content/blog/*.mdx file has the frontmatter fields the blog
// route requires (title, description, date). Run as a "prebuild" step so a
// malformed post fails in seconds, not 4 minutes into static generation.
//
// This intentionally duplicates the runtime skip-and-warn logic in
// lib/blog.ts (getFilePostSlugs) rather than importing it: that file is
// TypeScript and this script needs to run as plain Node before the build
// even starts, with no compile step.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const REQUIRED_FIELDS = ["title", "description", "date"];

function missingRequiredFields(data) {
  return REQUIRED_FIELDS.filter((field) => {
    const value = data[field];
    return typeof value !== "string" || !value.trim();
  });
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log("[validate-content] No content/blog directory found, nothing to validate.");
    return;
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const failures = [];

  for (const filename of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
    const { data } = matter(raw);
    const missing = missingRequiredFields(data);
    if (missing.length > 0) {
      failures.push({ filename, missing });
    }
  }

  if (failures.length > 0) {
    console.error(`[validate-content] ${failures.length} of ${files.length} blog post(s) failed validation:\n`);
    for (const { filename, missing } of failures) {
      console.error(`  - ${filename}: missing ${missing.join(", ")}`);
    }
    console.error("\nFix or remove these files before building. Required frontmatter fields: " + REQUIRED_FIELDS.join(", "));
    process.exit(1);
  }

  console.log(`[validate-content] OK: all ${files.length} blog post(s) have required frontmatter.`);
}

main();
