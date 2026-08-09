import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const reason = url.searchParams.get("reason") ?? "general";

  const heading =
    reason === "expired" ? "This job posting has expired" : "This content has been removed";

  const message =
    reason === "privacy"
      ? "We no longer host candidate resumes for privacy reasons."
      : reason === "expired"
      ? "This role is no longer accepting applications."
      : "This page is no longer available.";

  const html = `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="utf-8">
  <title>Content removed | Addify</title>
  <meta name="robots" content="noindex,nofollow">
  <style>
    body{font-family:system-ui,sans-serif;max-width:560px;margin:80px auto;padding:0 20px;text-align:center;color:#0A1628}
    h1{font-size:1.75rem;margin-bottom:1rem}
    p{color:#64748b;margin-bottom:1.5rem}
    a{color:#F59E0B;text-decoration:none}
    a:hover{text-decoration:underline}
  </style>
</head><body>
  <h1>${heading}</h1>
  <p>${message}</p>
  <a href="/jobs">Browse current jobs &rarr;</a>
</body></html>`;

  return new NextResponse(html, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
