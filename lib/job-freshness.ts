// A job older than this, by posted_at, is treated as stale for SEO purposes:
// noindexed, stripped of its Featured badge, and excluded from the sitemap.
// Separate from expires_at gating (a stale job may still be a real, live,
// applicable posting — it just shouldn't be presented to search engines as
// fresh, unfeatured content).
const STALE_AFTER_DAYS = 90;

export function isStaleJob(postedAt: string | null | undefined): boolean {
  if (!postedAt) return false;
  const ageMs = Date.now() - new Date(postedAt).getTime();
  return ageMs > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;
}
