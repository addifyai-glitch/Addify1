import { test, expect } from "@playwright/test";
import { KEY_PAGES } from "./helpers";

const SITE = "https://addify.ae";

test.describe("on-page SEO", () => {
  for (const path of KEY_PAGES) {
    test(`${path} has title, description, self-canonical and valid JSON-LD`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      // Read everything in one pass: a missing tag must fail fast, not wait.
      const meta = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
        robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ""),
      }));

      expect(meta.title.length, "title length").toBeGreaterThan(10);
      expect(meta.title.length, "title length").toBeLessThanOrEqual(70);

      expect(meta.description.length, "description length").toBeGreaterThanOrEqual(50);
      expect(meta.description.length, "description length").toBeLessThanOrEqual(170);

      const expected = path === "/" ? [SITE, `${SITE}/`] : [`${SITE}${path}`];
      expect(expected, `canonical must point at this page (got ${meta.canonical})`).toContain(meta.canonical);

      expect(meta.robots, "indexable page must not be noindex").not.toContain("noindex");

      expect(meta.ld.length, "at least one JSON-LD block").toBeGreaterThan(0);
      for (const block of meta.ld) {
        expect(() => JSON.parse(block), "JSON-LD must parse").not.toThrow();
      }
    });
  }

  test("titles are unique across key pages", async ({ page }) => {
    const seen = new Map<string, string>();
    for (const path of KEY_PAGES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const title = await page.title();
      expect(seen.get(title), `"${title}" is used by ${seen.get(title)} and ${path}`).toBeUndefined();
      seen.set(title, path);
    }
  });
});

test.describe("crawl files", () => {
  test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/Sitemap:\s*https:\/\/addify\.ae\/sitemap\.xml/i);
    expect(body).not.toMatch(/^Disallow:\s*\/\s*$/m);
  });

  test("every sitemap URL returns 200", async ({ request }) => {
    test.setTimeout(180_000);
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>https:\/\/addify\.ae([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
    expect(paths.length, "sitemap has URLs").toBeGreaterThan(10);

    const failures: string[] = [];
    const queue = [...paths];
    const worker = async () => {
      for (let p = queue.shift(); p !== undefined; p = queue.shift()) {
        const res = await request.get(p, { maxRedirects: 0 });
        if (res.status() !== 200) failures.push(`${res.status()} ${p}`);
      }
    };
    await Promise.all(Array.from({ length: 8 }, worker));
    expect(failures, "sitemap URLs that are not 200").toEqual([]);
  });
});
