import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Addify Jobs <jobs@addify.ae>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://addify.ae";

export async function sendJobApprovedEmail(
  to: string,
  jobTitle: string,
  jobSlug: string
): Promise<{ sent: boolean }> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured, skipping job-approved email");
    return { sent: false };
  }

  const jobUrl = `${SITE_URL}/jobs/${jobSlug}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your job "${jobTitle}" is now live on Addify`,
      html: `
        <p>Good news, your job listing has been reviewed and is now live on Addify.</p>
        <p><strong>${jobTitle}</strong></p>
        <p><a href="${jobUrl}">${jobUrl}</a></p>
        <p>Thanks for posting with Addify.ae.</p>
      `,
    });

    if (error) {
      console.error("[email] Resend returned an error:", error);
      return { sent: false };
    }

    return { sent: true };
  } catch (e) {
    console.error("[email] Failed to send job-approved email:", e);
    return { sent: false };
  }
}
