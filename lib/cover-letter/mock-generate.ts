export type CoverLetterInputs = {
  resumeText: string;
  jdText: string;
  language: "english" | "arabic";
  tone: "professional" | "friendly" | "confident" | "concise";
  length: "short" | "medium" | "long";
  hiringManager: string;
  variant?: number; // 0, 1, or 2
};

export type CoverLetterOutput = {
  body: string;
  greeting: string;
  closing: string;
};

function extractHint(text: string, keywords: string[]): string {
  if (!text) return "";
  const lower = text.toLowerCase();
  return keywords.find((k) => lower.includes(k.toLowerCase())) ?? "";
}

function extractJobTitle(jd: string): string {
  const patterns = [
    /(?:position|role|job title|we are hiring|we.re looking for)[:\s]+([A-Z][^\n,\.]{3,50})/i,
    /^([A-Z][A-Za-z\s]{3,40})\n/m,
  ];
  for (const re of patterns) {
    const m = jd.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return "the role";
}

function extractCompany(jd: string): string {
  const patterns = [
    /(?:at|join|about)\s+([A-Z][A-Za-z0-9\s&]{2,30})(?:\s+is|\s+are|\s*[,\.])/i,
    /([A-Z][A-Za-z0-9\s&]{2,25})\s+(?:is hiring|is looking|is seeking)/i,
  ];
  for (const re of patterns) {
    const m = jd.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return "your team";
}

const SKILL_KEYWORDS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "AWS", "Azure",
  "data analysis", "machine learning", "project management", "stakeholder management",
  "financial modelling", "accounting", "auditing", "marketing strategy",
  "digital marketing", "SEO", "product management", "UX design", "Agile", "Scrum",
  "procurement", "supply chain", "HR", "recruitment", "business development",
  "sales", "client management", "team leadership",
];

const EXPERIENCE_HINTS = [
  "five years", "six years", "seven years", "eight years", "three years", "four years",
];

function pickSkill(resume: string): string {
  return extractHint(resume, SKILL_KEYWORDS) || "delivering results";
}

function pickExperience(resume: string): string {
  return extractHint(resume, EXPERIENCE_HINTS) || "several years";
}

function greetingLine(hiringManager: string): string {
  return hiringManager.trim()
    ? `Dear ${hiringManager.trim()},`
    : "Dear Hiring Manager,";
}

const CLOSINGS = {
  professional: "Thank you for considering my application. I am available at your convenience to discuss further.",
  friendly: "Thanks so much for taking the time to read this. I would genuinely love the chance to chat.",
  confident: "I look forward to the conversation. I am confident this would be a strong fit for both of us.",
  concise: "Happy to discuss at your convenience.",
};

function buildShort(
  inputs: CoverLetterInputs,
  jobTitle: string,
  company: string,
  skill: string,
  experience: string,
  greeting: string,
  closing: string
): string {
  return `${greeting}

I am applying for the ${jobTitle} position at ${company}. With ${experience} of hands-on experience in ${skill}, I believe I can contribute meaningfully to your team from day one.

${closing}`;
}

function buildMediumVariant0(
  inputs: CoverLetterInputs,
  jobTitle: string,
  company: string,
  skill: string,
  experience: string,
  greeting: string,
  closing: string
): string {
  return `${greeting}

I am writing to express my interest in the ${jobTitle} position at ${company}. With ${experience} and a track record in ${skill}, I am confident I can contribute meaningfully to your team from day one.

In my recent work, I have focused on ${skill} and delivering measurable outcomes in fast-paced Gulf market environments. The priorities outlined in your job description align closely with what I have spent my career building. I bring not just the technical skills you have listed, but the practical judgment that comes from doing this work in a regional context.

What draws me to ${company} specifically is the scale of the challenge and the opportunity to work with a team that clearly takes this seriously. I would welcome the chance to discuss how my background fits what you are building.

${closing}`;
}

function buildMediumVariant1(
  inputs: CoverLetterInputs,
  jobTitle: string,
  company: string,
  skill: string,
  experience: string,
  greeting: string,
  closing: string
): string {
  return `${greeting}

I came across the ${jobTitle} role at ${company} and felt I had to apply. After ${experience} working in ${skill}, this is exactly the kind of opportunity I have been looking for.

What caught my attention was how closely the role maps to the work I have been doing. I have spent years building expertise in ${skill}, and I have done it in markets similar to yours, where speed, clarity, and commercial awareness matter as much as technical depth.

I am not the type who applies to everything and hopes for the best. I applied here because the fit looked genuinely strong. I would be glad to prove that in a conversation.

${closing}`;
}

function buildMediumVariant2(
  inputs: CoverLetterInputs,
  jobTitle: string,
  company: string,
  skill: string,
  experience: string,
  greeting: string,
  closing: string
): string {
  return `${greeting}

When I read your ${jobTitle} job description, several things stood out as direct matches for what I have been doing for the past ${experience}. Specifically: ${skill}, working across Gulf and regional teams, and delivering results where ambiguity is the norm.

I will not walk you through my entire history. The short version: I have the core skills you need, I have used them in real situations, and I have the self-awareness to know where I still have room to grow. That combination is harder to find than most job descriptions acknowledge.

${company} looks like the kind of place where the work actually matters. That is what I am looking for.

${closing}`;
}

function buildLong(
  inputs: CoverLetterInputs,
  jobTitle: string,
  company: string,
  skill: string,
  experience: string,
  greeting: string,
  closing: string
): string {
  return `${greeting}

I am writing to apply for the ${jobTitle} position at ${company}. Having spent ${experience} building expertise in ${skill}, I was immediately drawn to this role when I read your job description.

Throughout my career, I have developed a deep understanding of ${skill} and how to apply it effectively in complex, fast-moving environments. Working in the Gulf region has given me practical exposure to the specific challenges your team likely faces: navigating multi-stakeholder environments, balancing speed with accuracy, and delivering results that hold up under scrutiny.

What I bring beyond the technical skills is context. I understand what matters in this market and what does not. I have made mistakes, learned from them, and built better approaches as a result. That kind of accumulated judgment is what I would bring to this role from day one.

I have been following ${company}'s work with genuine interest. The way you approach this space reflects the kind of rigour I want to be part of. I am not looking for a role. I am looking for a team worth joining.

I would welcome the chance to talk through how my background maps to what you need.

${closing}`;
}

const ARABIC_PLACEHOLDER = `عزيزي مسؤول التوظيف،

تتطلب الكتابة باللغة العربية الاتصال بـ Claude API. سيتم تفعيل ذلك قريباً.

Arabic generation activates with the live AI integration in our next update.

مع التقدير`;

export function generateCoverLetter(inputs: CoverLetterInputs): CoverLetterOutput {
  if (inputs.language === "arabic") {
    return {
      greeting: "عزيزي مسؤول التوظيف،",
      body: ARABIC_PLACEHOLDER,
      closing: "مع التقدير",
    };
  }

  const jobTitle = extractJobTitle(inputs.jdText) || "the role";
  const company = extractCompany(inputs.jdText) || "your team";
  const skill = pickSkill(inputs.resumeText) || "delivering results in complex environments";
  const experience = pickExperience(inputs.resumeText) || "several years";
  const greeting = greetingLine(inputs.hiringManager);
  const closing = CLOSINGS[inputs.tone];

  const variantIndex = (inputs.variant ?? 0) % 3;

  if (inputs.length === "short") {
    return {
      greeting,
      body: buildShort(inputs, jobTitle, company, skill, experience, greeting, closing),
      closing,
    };
  }

  if (inputs.length === "long") {
    return {
      greeting,
      body: buildLong(inputs, jobTitle, company, skill, experience, greeting, closing),
      closing,
    };
  }

  // medium
  const builders = [buildMediumVariant0, buildMediumVariant1, buildMediumVariant2];
  const body = builders[variantIndex](inputs, jobTitle, company, skill, experience, greeting, closing);

  return { greeting, body, closing };
}
