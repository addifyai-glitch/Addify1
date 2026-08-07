import Anthropic from "@anthropic-ai/sdk";

export interface FitAnalysis {
  score: number; // 0-100
  verdict: "strong_fit" | "moderate_fit" | "weak_fit";
  summary: string;
  matched_skills: string[];
  missing_skills: string[];
  transferable_experience: string[];
  recommendations: string[];
  interview_talking_points: string[];
  honest_warning: string | null;
}

const SYSTEM_PROMPT = `You are an experienced Gulf-market career coach who has reviewed thousands of applications for UAE, Saudi, Qatar, Kuwait, Bahrain, and Oman roles.

Your job: assess how well a candidate's resume fits a specific job description. Be honest, specific, and useful, not diplomatic or vague.

Gulf hiring context to keep in mind:
- Nationality is often a real screening factor (though never publicly stated)
- Arabic language ability affects many roles significantly
- UAE/Saudi ATS systems (Workday, SuccessFactors, Taleo) do initial screening
- Gulf employers value specific certifications more than western equivalents (AWS Middle East, CBUAE Cloud, PDPL)
- Visa transfer complexity matters, mention it if candidate needs transfer
- "Overqualified" is a real rejection reason in Gulf market

Return ONLY valid JSON matching this shape:
{
  "score": 0-100,
  "verdict": "strong_fit" | "moderate_fit" | "weak_fit",
  "summary": "2-3 sentence honest assessment",
  "matched_skills": ["specific skills candidate has that job wants"],
  "missing_skills": ["specific skills job wants that candidate lacks"],
  "transferable_experience": ["relevant experience that isn't a direct match"],
  "recommendations": ["3-5 specific actionable suggestions"],
  "interview_talking_points": ["3-5 things to emphasize if they apply"],
  "honest_warning": "if fit is genuinely poor, name why directly, or null"
}

Score guidelines:
- 80-100: strong_fit. Candidate clearly qualifies and would likely progress past ATS screen.
- 60-79: moderate_fit. Some gaps but worth applying with strong cover letter addressing them.
- 40-59: weak_fit. Significant gaps. Apply only if candidate can address in cover letter.
- Below 40: weak_fit with honest_warning. Don't sugarcoat.

Be specific in matched/missing skills (name the actual skill: "AWS EC2", "Arabic business fluency", "PDPL compliance") not vague ("technical skills", "communication").

No preamble. No markdown. Return ONLY the JSON object.`;

function getClient(): Anthropic | null {
  return process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
}

export async function analyzeFit(resumeText: string, jobDescription: string): Promise<FitAnalysis> {
  const client = getClient();
  if (!client) {
    throw new Error("AI analysis is not configured");
  }

  if (resumeText.length < 200) {
    throw new Error("Please provide more resume detail (at least 200 characters)");
  }

  if (jobDescription.length < 100) {
    throw new Error("Please provide the full job description (at least 100 characters)");
  }

  const cappedResume = resumeText.length > 8000 ? resumeText.slice(0, 8000) : resumeText;
  const cappedJD = jobDescription.length > 8000 ? jobDescription.slice(0, 8000) : jobDescription;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `RESUME:\n${cappedResume}\n\n---\n\nJOB DESCRIPTION:\n${cappedJD}\n\n---\n\nAnalyze the fit.`,
      },
    ],
  });

  const textContent = message.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No analysis returned");
  }

  let jsonText = textContent.text.trim();
  if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
  if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
  if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
  jsonText = jsonText.trim();

  let parsed: FitAnalysis;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    console.error("[fit-score] JSON parse failed:", e);
    console.error("[fit-score] Raw response:", textContent.text);
    throw new Error("Analysis format error. Please try again.");
  }

  if (
    typeof parsed.score !== "number" ||
    !Array.isArray(parsed.matched_skills) ||
    !Array.isArray(parsed.missing_skills) ||
    !Array.isArray(parsed.recommendations)
  ) {
    throw new Error("Analysis structure invalid. Please try again.");
  }

  parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  parsed.transferable_experience = Array.isArray(parsed.transferable_experience) ? parsed.transferable_experience : [];
  parsed.interview_talking_points = Array.isArray(parsed.interview_talking_points) ? parsed.interview_talking_points : [];
  parsed.honest_warning = typeof parsed.honest_warning === "string" ? parsed.honest_warning : null;

  return parsed;
}
