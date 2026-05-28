import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifyRecaptcha } from '@/lib/recaptcha';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { summary, jobTitle, captchaToken } = await req.json();

    const captcha = await verifyRecaptcha(captchaToken || '');
    if (!captcha.success) {
      return NextResponse.json({ error: 'Spam check failed. Refresh and try again.' }, { status: 403 });
    }

    if (!summary || summary.trim().length < 20) {
      return NextResponse.json(
        { error: 'Write at least a rough summary (20+ characters) first, then improve it.' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: "You are a professional resume writer. Rewrite the user's professional summary to be concise, impactful, and ATS-friendly. Keep it to 2-3 sentences, around 40-60 words. Use active voice and concrete value. Do not invent specific facts, metrics, or employers not present in the original. Return ONLY the improved summary text, no preamble, no quotes, no options.",
      messages: [
        {
          role: 'user',
          content: `Job title: ${jobTitle || 'not specified'}\n\nCurrent summary:\n${summary}\n\nRewrite it.`,
        },
      ],
    });

    const textBlock = message.content.find((c) => c.type === 'text');
    const improved = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : '';

    if (!improved) {
      return NextResponse.json({ error: 'Could not generate an improved summary' }, { status: 500 });
    }

    return NextResponse.json({ success: true, improved });
  } catch (e) {
    console.error('[improve-summary]', e);
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
