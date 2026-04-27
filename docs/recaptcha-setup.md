# reCAPTCHA v3 Setup

## Steps

1. Go to https://www.google.com/recaptcha/admin/create
2. Choose **reCAPTCHA v3**
3. Add domains: `addify.ae` and `localhost`
4. Copy the **site key** into `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` in `.env.local`
5. Copy the **secret key** into `RECAPTCHA_SECRET_KEY` in `.env.local`
6. Add both variables to Vercel environment variables when deploying

## Protected forms

| Form | reCAPTCHA action |
|------|-----------------|
| /submit-job | `submit_job` |
| /contribute | `submit_salary` |
| /contact | `contact_form` |
| /data-deletion | `data_deletion` |

## Graceful degradation

If `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is not set:
- The `RecaptchaProvider` renders children without wrapping them in Google's script
- `useGoogleReCaptcha` returns `executeRecaptcha = undefined`
- Forms guard with `executeRecaptcha ? await executeRecaptcha(action) : ""`
- Empty token is sent; the server utility (`lib/recaptcha.ts`) passes it through when `RECAPTCHA_SECRET_KEY` is also missing
- A dev-only banner appears in forms reminding you to configure the key

## Server verification

`lib/recaptcha.ts` exports `verifyRecaptcha(token)`. Call it in API routes before processing the submission:

```typescript
import { verifyRecaptcha } from "@/lib/recaptcha";

const { success, score } = await verifyRecaptcha(body.captchaToken ?? "");
if (!success || score < 0.5) {
  return Response.json({ error: "Verification failed. Please refresh and try again." }, { status: 400 });
}
```
