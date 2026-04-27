export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return { success: true, score: 1.0 };
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const data = await response.json();
  return { success: data.success === true, score: data.score || 0 };
}
