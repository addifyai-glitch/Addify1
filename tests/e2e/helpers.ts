import type { Page } from "@playwright/test";

// Key public pages: one per template. Add a row when you add a template.
export const KEY_PAGES = [
  "/",
  "/tools",
  "/tools/gratuity-calculator",
  "/tools/resume-builder",
  "/salary",
  "/salary/software-engineer/dubai",
  "/salary/compare/software-engineer-salary-dubai-vs-abu-dhabi",
  "/research/uae-salary-report-2026",
  "/blog",
  "/jobs",
  "/about",
  "/methodology",
  "/contact",
  "/privacy",
];

// Collects uncaught JavaScript errors from our own code. Network failures of
// third-party scripts (ads, analytics) are ignored: they depend on the network
// the test runs on, not on our code.
export function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}
