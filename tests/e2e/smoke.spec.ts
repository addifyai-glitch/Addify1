import { test, expect } from "@playwright/test";
import { KEY_PAGES, trackPageErrors } from "./helpers";

test.describe("key pages render", () => {
  for (const path of KEY_PAGES) {
    test(`${path} loads with one h1 and no JS errors`, async ({ page }) => {
      const errors = trackPageErrors(page);
      const res = await page.goto(path, { waitUntil: "load" });
      expect(res?.status(), `HTTP status for ${path}`).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      expect(errors, `uncaught JS errors on ${path}`).toEqual([]);
    });
  }
});

test("health endpoint answers ok and is not cached", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ status: "ok" });
  expect(res.headers()["cache-control"]).toContain("no-store");
});

test.describe("removed features stay removed (410)", () => {
  for (const path of ["/contribute", "/fit", "/api/tools/fit-score", "/rbtv77-web/"]) {
    test(path, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 2 });
      expect(res.status()).toBe(410);
    });
  }
});

test("OG image route returns a PNG", async ({ request }) => {
  const res = await request.get("/api/og/default?title=Test");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
});
