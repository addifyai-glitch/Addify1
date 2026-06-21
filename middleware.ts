import { NextRequest, NextResponse } from "next/server";

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

export function middleware(req: NextRequest) {
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

  // Admin route protection — redirect to login if no Supabase session cookie
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = req.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

    if (!hasSession) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
