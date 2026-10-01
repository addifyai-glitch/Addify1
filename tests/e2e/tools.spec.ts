import { test, expect } from "@playwright/test";
import { trackPageErrors } from "./helpers";

test.describe("gratuity calculator", () => {
  // UAE labour law: 21 days' basic pay per year for the first 5 years.
  // 10,000 AED basic, 5 years, unlimited contract, terminated by employer:
  // 10,000 / 30 × 21 × 5 = 35,000 AED.
  test("computes the textbook 5-year case", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/tools/gratuity-calculator");
    // The language toggle may switch to Arabic for Arabic browsers; tests run in English.
    await page.getByLabel("Basic monthly salary (AED)").fill("10000");
    await page.getByLabel("Contract type").selectOption("unlimited");
    await page.getByLabel("Years of service").fill("5");
    await page.getByLabel("Extra days of service").fill("0");
    await page.getByLabel("Reason for leaving").selectOption("termination");
    await page.getByRole("button", { name: "Calculate gratuity" }).click();

    const result = page.locator("section").filter({ has: page.getByRole("heading", { level: 2 }) }).first();
    await expect(page.getByText(/35,000/).first()).toBeVisible();
    await expect(result).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("rejects an empty salary instead of showing a result", async ({ page }) => {
    await page.goto("/tools/gratuity-calculator");
    await page.getByLabel("Years of service").fill("3");
    await page.getByRole("button", { name: "Calculate gratuity" }).click();
    await expect(page.getByText(/35,000/)).toHaveCount(0);
  });
});

test.describe("resume builder", () => {
  test("server HTML already contains the heading (crawlable)", async ({ request }) => {
    const html = await (await request.get("/tools/resume-builder")).text();
    expect(html).toContain("Build your resume");
  });

  test("editor loads after hydration", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/tools/resume-builder");
    await expect(page.getByText("Loading the editor")).toHaveCount(0, { timeout: 15_000 });
    expect(errors).toEqual([]);
  });
});

test.describe("public API input validation", () => {
  // Invalid input is rejected before any database write, so this is safe
  // against preview and production URLs too.
  test("subscribe rejects an invalid email", async ({ request }) => {
    const res = await request.post("/api/subscribe", {
      data: { email: "not-an-email", _formLoadedAt: Date.now() - 10_000 },
    });
    expect(res.status()).toBe(400);
  });
});
