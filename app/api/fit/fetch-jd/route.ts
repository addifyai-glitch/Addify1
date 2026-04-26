import { NextRequest, NextResponse } from "next/server";

function htmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({ url: "" }));

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL. Please enter a full URL starting with https://" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Only http and https URLs are supported" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Addify-bot/1.0; +https://addify.ae)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timer);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not fetch that page (HTTP ${response.status}). Try pasting the job description instead.` },
        { status: 422 }
      );
    }

    const html = await response.text();
    const text = htmlToText(html).slice(0, 10000);

    if (text.length < 100) {
      return NextResponse.json(
        { error: "The page did not have enough readable text. Try pasting the job description instead." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, domain: parsed.hostname });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { error: isAbort ? "The page took too long to load. Try pasting the job description instead." : "Could not fetch that URL. Try pasting the job description instead." },
      { status: 422 }
    );
  }
}
