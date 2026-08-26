import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const reason = url.searchParams.get("reason") ?? "general";

  const heading =
    reason === "expired" ? "This job posting has expired" :
    reason === "legacy-job" ? "This listing has closed" :
    "This content has been removed";

  const message =
    reason === "privacy"
      ? "We no longer host candidate resumes for privacy reasons."
      : reason === "expired"
      ? "This role is no longer accepting applications."
      : reason === "legacy-job"
      ? "This job posting is from an old listing that's no longer active. Try one of these instead:"
      : "This page is no longer available.";

  // Legacy WordPress-era job listings (posted 2021, apply links long dead)
  // get a fuller set of links than the default single "browse jobs" —
  // these pages carry five years of accumulated direct traffic and
  // bookmarks, so send that traffic somewhere useful rather than a
  // bare dead end.
  const links =
    reason === "legacy-job"
      ? [
          { href: "/jobs", label: "Browse current jobs" },
          { href: "/salary", label: "Check your salary" },
          { href: "/tools/gratuity-calculator", label: "Calculate your gratuity" },
        ]
      : [{ href: "/jobs", label: "Browse current jobs" }];

  const linksHtml = links
    .map((l) => `<a href="${l.href}">${l.label} &rarr;</a>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="utf-8">
  <title>Content removed | Addify</title>
  <meta name="robots" content="noindex,nofollow">
  <style>
    body{font-family:system-ui,sans-serif;max-width:560px;margin:80px auto;padding:0 20px;text-align:center;color:#0A1628}
    h1{font-size:1.75rem;margin-bottom:1rem}
    p{color:#64748b;margin-bottom:1.5rem}
    .links{display:flex;flex-direction:column;gap:0.75rem;align-items:center}
    a{color:#F59E0B;text-decoration:none}
    a:hover{text-decoration:underline}
  </style>
</head><body>
  <h1>${heading}</h1>
  <p>${message}</p>
  <div class="links">${linksHtml}</div>
</body></html>`;

  return new NextResponse(html, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
