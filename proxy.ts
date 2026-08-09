import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Legacy spam URLs inherited from the previous domain owner.
// Returning 410 (Gone) tells Google to deindex them faster than 404.
const LEGACY_SPAM_PATTERNS: RegExp[] = [
  /sassa/i,
  /\bgrant\b/i,
  /rbtv77/i,
  /\bslot\b/i,
  /\bgacor\b/i,
  /payment-for-20(1|2)\d/i,
];

const LEGACY_SPAM_EXACT = new Set<string>([
  "/when-do-sassa-grants-get-paid/",
  "/when-is-the-next-sassa-payment-for-2021/",
  "/rbtv77-web/",
]);

// Real former-employer profile pages from the WordPress job board, removed
// deliberately — these companies aren't on the new platform. Not spam, so
// kept as its own block rather than folded into LEGACY_SPAM_PATTERNS.
const LEGACY_EMPLOYER_PREFIX = "/employer/";

// Off-topic blog posts removed from blog_posts (not a Gulf careers/salary/
// visa/employment topic) with no equivalent destination — deliberately gone,
// not a redirect candidate.
const LEGACY_REMOVED_BLOG_POSTS = new Set<string>([
  "/blog/start-earning-free-rewards-with-microsoft-rewards-no-cost-just-daily-browsing",
]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 410 Gone for inherited legacy spam
  const normalised = pathname.endsWith("/") ? pathname : pathname + "/";
  const isSpam =
    LEGACY_SPAM_EXACT.has(normalised) ||
    LEGACY_SPAM_PATTERNS.some((re) => re.test(pathname));

  if (isSpam) {
    return new NextResponse(
      `<!doctype html><html><head><meta name="robots" content="noindex"><title>410 Gone</title></head>` +
      `<body><h1>410 Gone</h1><p>This page no longer exists. Visit <a href="https://addify.ae">Addify</a>.</p></body></html>`,
      { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // 410 Gone for legacy WordPress employer profile pages
  if (pathname.startsWith(LEGACY_EMPLOYER_PREFIX)) {
    return new NextResponse(
      `<!doctype html><html><head><meta name="robots" content="noindex"><title>410 Gone</title></head>` +
      `<body><h1>410 Gone</h1><p>This employer page no longer exists. Visit <a href="https://addify.ae">Addify</a>.</p></body></html>`,
      { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // 410 Gone for removed off-topic blog posts
  if (LEGACY_REMOVED_BLOG_POSTS.has(pathname) || LEGACY_REMOVED_BLOG_POSTS.has(normalised)) {
    return new NextResponse(
      `<!doctype html><html><head><meta name="robots" content="noindex"><title>410 Gone</title></head>` +
      `<body><h1>410 Gone</h1><p>This post has been removed. Visit <a href="https://addify.ae/blog">the Addify blog</a>.</p></body></html>`,
      { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // 410 Gone for the removed salary submission feature. The page and its
  // API route are gone — not worth fixing or maintaining, per the decision
  // to remove it entirely rather than repair the broken insert path.
  if (pathname === "/contribute" || pathname.startsWith("/contribute/")) {
    return new NextResponse(
      `<!doctype html><html><head><meta name="robots" content="noindex"><title>410 Gone</title></head>` +
      `<body><h1>410 Gone</h1><p>This feature is no longer available. Visit <a href="https://addify.ae/salary">Addify's Salary Check</a>.</p></body></html>`,
      { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // 410 Gone, directly at the URL, for legacy WordPress candidate profiles.
  // Privacy takedown of real individuals' names + CV links — no redirect hop,
  // so there's no intermediate 3xx for a crawler to consolidate as canonical.
  if (pathname === "/candidate" || pathname.startsWith("/candidate/")) {
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow">` +
      `<title>Content removed | Addify</title></head>` +
      `<body><h1>This content has been removed</h1><p>We no longer host candidate resumes for privacy reasons.</p>` +
      `<a href="/jobs">Browse current jobs &rarr;</a></body></html>`,
      { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Admin route protection — validate session and auto-refresh token
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If Supabase not configured (local dev without env), allow through
    if (!supabaseUrl || !supabaseKey) return NextResponse.next();

    let response = NextResponse.next({ request: req });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Propagate refreshed cookies to both the request and response
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // getUser() verifies the JWT and refreshes it via refresh token if expired
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
