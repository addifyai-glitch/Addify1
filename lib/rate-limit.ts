import { createHash } from "crypto";

const SALT = process.env.RATE_LIMIT_SALT ?? "addify-rl-salt";

type Window = { hits: number[]; cleanedAt: number };
const store = new Map<string, Window>();

const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

function ipKey(ip: string): string {
  return createHash("sha256").update(ip + SALT).digest("hex").slice(0, 24);
}

function pruneStore() {
  const now = Date.now();
  for (const [key, win] of store.entries()) {
    if (now - win.cleanedAt > CLEANUP_INTERVAL) {
      store.delete(key);
    }
  }
}

/**
 * Returns true if the IP has exceeded `limit` hits within the rolling `windowMs`.
 * Mutates the in-memory store on each call.
 */
export function isRateLimited(
  ip: string,
  limit: number,
  windowMs = 60 * 60 * 1000
): boolean {
  pruneStore();
  const key = ipKey(ip);
  const now = Date.now();
  const existing = store.get(key);
  const hits = existing
    ? existing.hits.filter((t) => now - t < windowMs)
    : [];

  if (hits.length >= limit) {
    store.set(key, { hits, cleanedAt: now });
    return true;
  }

  store.set(key, { hits: [...hits, now], cleanedAt: now });
  return false;
}

export function getIP(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}
