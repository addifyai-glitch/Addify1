import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. You can submit up to 3 deletion requests per day." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, requestType, description, captchaToken } = body;

    if (!name || !email || !requestType) {
      return NextResponse.json({ error: "Name, email, and request type are required." }, { status: 400 });
    }

    const { success, score } = await verifyRecaptcha(captchaToken ?? "");
    if (!success || score < 0.5) {
      return NextResponse.json(
        { error: "Verification failed. Please refresh and try again." },
        { status: 400 }
      );
    }

    const request = { name, email, requestType, description, submittedAt: new Date().toISOString(), ip };

    console.log("[data-deletion] Request received:", request);

    return NextResponse.json({
      success: true,
      message: "Request received. We will respond within 30 days.",
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
