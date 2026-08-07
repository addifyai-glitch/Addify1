import { NextRequest, NextResponse } from "next/server";
import { analyzeFit } from "@/lib/analyzers/fit-score";
import { verifyRecaptcha } from "@/lib/recaptcha";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, captchaToken } = await req.json();

    const captcha = await verifyRecaptcha(captchaToken || "");
    if (!captcha.success) {
      return NextResponse.json({ error: "Spam check failed. Refresh and try again." }, { status: 403 });
    }

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }
    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const analysis = await analyzeFit(resumeText, jobDescription);

    return NextResponse.json({ success: true, analysis });
  } catch (e) {
    console.error("[fit-score]", e);
    const message = e instanceof Error ? e.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
