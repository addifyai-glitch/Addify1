"use client";

export function CaptchaNotice() {
  if (process.env.NODE_ENV !== "development") return null;
  if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) return null;

  return (
    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
      Captcha not configured. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY to enable spam protection.
    </p>
  );
}
