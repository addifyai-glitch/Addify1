// lib/salary-taxonomy.ts
// Single source of truth for cities + roles for the programmatic salary pages.
// Slug format: lowercase, hyphens, parenthetical content expanded.

export type Currency = "AED" | "SAR" | "QAR" | "KWD" | "BHD" | "OMR" | "EGP";

export interface City {
  name: string;
  slug: string;
  country: string;
  currency: Currency;
}

export interface Role {
  name: string;
  slug: string;
  category: string;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\(([^)]*)\)/g, " $1 ")
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function assertNoSlugCollisions(): void {
  for (const [label, items] of [["role", ROLES] as const, ["city", CITIES] as const]) {
    const seen = new Map<string, string>();
    for (const it of items) {
      const prev = seen.get(it.slug);
      if (prev && prev !== it.name) {
        throw new Error(`[salary-taxonomy] ${label} slug collision: "${prev}" and "${it.name}" both -> "${it.slug}"`);
      }
      seen.set(it.slug, it.name);
    }
  }
}

const CITY_DATA: Array<[string, string, Currency]> = [
  ["Dubai", "UAE", "AED"], ["Abu Dhabi", "UAE", "AED"], ["Sharjah", "UAE", "AED"],
  ["Ajman", "UAE", "AED"], ["Ras Al Khaimah", "UAE", "AED"], ["Fujairah", "UAE", "AED"],
  ["Umm Al Quwain", "UAE", "AED"],
  ["Riyadh", "Saudi Arabia", "SAR"], ["Jeddah", "Saudi Arabia", "SAR"],
  ["Mecca", "Saudi Arabia", "SAR"], ["Medina", "Saudi Arabia", "SAR"],
  ["Dammam", "Saudi Arabia", "SAR"], ["Khobar", "Saudi Arabia", "SAR"],
  ["Dhahran", "Saudi Arabia", "SAR"], ["Taif", "Saudi Arabia", "SAR"],
  ["Tabuk", "Saudi Arabia", "SAR"], ["Abha", "Saudi Arabia", "SAR"],
  ["Doha", "Qatar", "QAR"], ["Al Rayyan", "Qatar", "QAR"],
  ["Kuwait City", "Kuwait", "KWD"], ["Hawalli", "Kuwait", "KWD"], ["Salmiya", "Kuwait", "KWD"],
  ["Manama", "Bahrain", "BHD"], ["Riffa", "Bahrain", "BHD"], ["Muharraq", "Bahrain", "BHD"],
  ["Muscat", "Oman", "OMR"], ["Salalah", "Oman", "OMR"], ["Sohar", "Oman", "OMR"],
  ["Nizwa", "Oman", "OMR"],
  ["Cairo", "Egypt", "EGP"], ["Alexandria", "Egypt", "EGP"], ["Giza", "Egypt", "EGP"],
  ["New Cairo", "Egypt", "EGP"], ["6th October City", "Egypt", "EGP"],
];

export const CITIES: City[] = CITY_DATA.map(([name, country, currency]) => ({
  name,
  slug: slugify(name),
  country,
  currency,
}));

const ROLE_DATA: Record<string, string[]> = {
  "Executive & C-Suite": [
    "Chief Executive Officer (CEO)", "Managing Director", "Chief Operating Officer (COO)",
    "Chief Financial Officer (CFO)", "Chief Technology Officer (CTO)", "Chief Marketing Officer (CMO)",
    "Chief Human Resources Officer (CHRO)", "Chief Information Officer (CIO)",
    "Chief Revenue Officer (CRO)", "Chief Product Officer (CPO)", "General Manager",
    "Country Manager", "Regional Director",
  ],
  "Technology & Engineering": [
    "Software Engineer", "Senior Software Engineer", "Staff / Principal Software Engineer",
    "Engineering Manager", "VP of Engineering", "DevOps Engineer", "Site Reliability Engineer",
    "Data Engineer", "Data Scientist", "Machine Learning Engineer", "AI / Research Engineer",
    "QA / Test Engineer", "Mobile Developer (iOS / Android)", "Frontend Developer",
    "Backend Developer", "Full-Stack Developer", "Solutions Architect", "Cloud Architect",
    "Cybersecurity Analyst", "Cybersecurity Manager", "IT Support Specialist", "IT Manager",
    "Head of IT",
  ],
  "Product & Design": [
    "Product Manager", "Senior Product Manager", "Director of Product", "VP of Product",
    "UX Designer", "UI Designer", "Product Designer", "Design Manager", "Graphic Designer",
    "Creative Director",
  ],
  "Finance & Accounting": [
    "Accountant", "Senior Accountant", "Finance Manager", "Financial Controller",
    "FP&A Analyst", "Internal Auditor", "Tax Manager", "Treasury Manager",
    "Investment Analyst", "Investment Manager", "VP Finance", "Finance Director",
  ],
  "Sales & Business Development": [
    "Sales Representative", "Account Executive", "Senior Account Executive", "Sales Manager",
    "Regional Sales Manager", "Head of Sales", "VP Sales", "Business Development Manager",
    "Partnerships Manager", "Key Account Manager",
  ],
  "Marketing & Communications": [
    "Marketing Executive", "Digital Marketing Specialist", "Content Marketing Manager",
    "SEO Specialist", "Performance Marketing Manager", "Social Media Manager", "Brand Manager",
    "Marketing Manager", "Head of Marketing", "VP Marketing", "PR Manager",
    "Communications Director",
  ],
  "Human Resources & People": [
    "HR Coordinator", "HR Business Partner", "Talent Acquisition Specialist",
    "Recruitment Manager", "Learning & Development Manager", "Compensation & Benefits Manager",
    "HR Manager", "Head of People", "VP People",
  ],
  "Operations & Supply Chain": [
    "Operations Analyst", "Operations Manager", "Head of Operations", "VP Operations",
    "Supply Chain Manager", "Logistics Manager", "Procurement Manager", "Warehouse Manager",
  ],
  "Legal & Compliance": [
    "Legal Counsel", "Senior Legal Counsel", "Compliance Officer", "Compliance Manager",
    "General Counsel",
  ],
  "Consulting & Strategy": [
    "Business Analyst", "Management Consultant", "Senior Consultant", "Strategy Manager",
    "Director of Strategy",
  ],
  "Construction & Real Estate": [
    "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Project Engineer",
    "Site Engineer", "Construction Manager", "Project Manager (Construction)",
    "Real Estate Agent", "Property Manager", "Facilities Manager",
  ],
  "Healthcare": [
    "Registered Nurse", "General Practitioner", "Medical Specialist / Consultant",
    "Pharmacist", "Hospital Administrator", "Medical Director",
  ],
  "Hospitality & Retail": [
    "Receptionist", "Guest Relations Manager", "Food & Beverage Manager", "Hotel Manager",
    "Retail Store Manager", "Retail Area Manager",
  ],
  "Education": [
    "Teacher (K-12)", "School Administrator", "University Lecturer", "Head of School / Principal",
  ],
  "Administration & Support": [
    "Executive Assistant", "Office Manager", "Customer Service Representative",
    "Customer Success Manager", "Head of Customer Success",
  ],
};

export const ROLES: Role[] = Object.entries(ROLE_DATA).flatMap(([category, names]) =>
  names.map((name) => ({ name, slug: slugify(name), category }))
);

export const EXPERIENCE_BANDS = ["0–2 years", "3–5 years", "6–10 years", "10+ years"] as const;

export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);
export const roleBySlug = (slug: string) => ROLES.find((r) => r.slug === slug);

export function rolesInSameCategory(role: Role, limit = 6): Role[] {
  return ROLES.filter((r) => r.category === role.category && r.slug !== role.slug).slice(0, limit);
}

export function citiesInSameCountry(city: City, limit = 6): City[] {
  return CITIES.filter((c) => c.country === city.country && c.slug !== city.slug).slice(0, limit);
}
