# Security and Spam Protection

## Four protection layers (no external service required)

### Layer 1: Honeypot field
All public form routes check for a `website` field in the POST body. Legitimate users never fill this field. Bots that auto-fill all inputs will trigger it. The route returns a fake success response so bots do not know they were blocked.

Routes covered: `/api/jobs/submit`, `/api/salaries/submit`, `/api/contact`, `/api/testimonials/submit`

To add to a new route:
```ts
const { website } = body;
if (website) return NextResponse.json({ success: true });
```

### Layer 2: In-memory rate limiting
`lib/rate-limit.ts` provides a shared `isRateLimited(ip, limit, windowMs)` function. It stores hit timestamps in a module-level Map, keyed by hashed IP. Entries older than the window are pruned every 10 minutes.

Default limits per endpoint:
- `/api/jobs/submit`: 3 per IP per hour (Supabase-side check)
- `/api/contact`: 5 per IP per hour
- `/api/salaries/submit`: 3 per IP per hour
- `/api/testimonials/submit`: 5 per IP per hour

Returns HTTP 429 when exceeded.

If a legitimate user is rate-limited, raise the limit constant in the relevant route file.

### Layer 3: Time-on-form minimum
Routes accept an optional `_formLoadedAt` field (Unix timestamp set by the client when the form mounts). If this field is present and the elapsed time is under 3 seconds, the submission is silently rejected. This catches the simplest auto-submit bots.

Client forms set this in state: `const [loadedAt] = useState(() => Date.now())` and include it in the POST body as `_formLoadedAt: loadedAt`.

### Layer 4: reCAPTCHA v3
`lib/recaptcha.ts` verifies tokens against Google. Graceful fallback: if `RECAPTCHA_SECRET_KEY` is not set, it returns `{ success: true, score: 1.0 }` so forms still work without keys.

To enable reCAPTCHA:
1. Go to https://www.google.com/recaptcha/admin and create a v3 site
2. Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` in Vercel environment variables
3. The badge will appear bottom-right automatically

## Decisions
- Rate limiter is in-memory. On Vercel (serverless), each function instance has its own Map. This means limits are per-instance, not global. For most traffic volumes this is sufficient. Replace with Redis if you need strict global limits.
- No secrets are logged. IP hashes use SHA-256 with a salt so raw IPs are never stored.
