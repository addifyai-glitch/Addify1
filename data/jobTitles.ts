/**
 * GulfFit job title taxonomy — source of truth for the salary tool.
 *
 * Rules:
 * - `fixedLevel` titles auto-select a leadership level and hide the dropdown.
 * - Titles without `fixedLevel` show both the Experience and Leadership dropdowns.
 * - The `salarySlug` links a title to its row in data/salaries.json where data exists.
 *   If null, computeSalary returns null and the UI shows a "no data" state.
 */

export type LeadershipLevel =
  | "individual-contributor"
  | "team-lead"
  | "manager"
  | "senior-manager"
  | "director"
  | "vice-president"
  | "c-suite";

export const LEADERSHIP_LEVELS: LeadershipLevel[] = [
  "individual-contributor",
  "team-lead",
  "manager",
  "senior-manager",
  "director",
  "vice-president",
  "c-suite",
];

export const LEADERSHIP_LABELS: Record<LeadershipLevel, string> = {
  "individual-contributor": "Individual Contributor",
  "team-lead":              "Team Lead / Senior IC",
  "manager":                "Manager",
  "senior-manager":         "Senior Manager",
  "director":               "Director",
  "vice-president":         "Vice President",
  "c-suite":                "C-Suite / MD",
};

/**
 * Salary multipliers relative to the Individual Contributor baseline (1.0).
 * Applied on top of the base experience-band salary from salaries.json.
 */
export const LEADERSHIP_MULTIPLIERS: Record<LeadershipLevel, number> = {
  "individual-contributor": 1.00,
  "team-lead":              1.15,
  "manager":                1.32,
  "senior-manager":         1.55,
  "director":               1.82,
  "vice-president":         2.20,
  "c-suite":                2.75,
};

export interface JobTitle {
  slug: string;
  title: string;
  category: string;
  /** When set, auto-selects this level and hides the Leadership dropdown. */
  fixedLevel?: LeadershipLevel;
  /**
   * Links to the key in data/salaries.json.
   * null = no data yet; form shows a friendly "no data" message.
   */
  salarySlug: string | null;
}

export interface JobCategory {
  name: string;
  slug: string;
  titles: JobTitle[];
}

export const JOB_CATEGORIES: JobCategory[] = [
  {
    name: "Executive & C-Suite",
    slug: "executive-c-suite",
    titles: [
      { slug: "chief-executive-officer",        title: "Chief Executive Officer (CEO)",      category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "managing-director",              title: "Managing Director",                  category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "chief-operating-officer",        title: "Chief Operating Officer (COO)",      category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "chief-financial-officer",        title: "Chief Financial Officer (CFO)",      category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "chief-technology-officer",       title: "Chief Technology Officer (CTO)",     category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "chief-marketing-officer",        title: "Chief Marketing Officer (CMO)",      category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "chief-human-resources-officer",  title: "Chief Human Resources Officer (CHRO)", category: "Executive & C-Suite", fixedLevel: "c-suite",       salarySlug: null },
      { slug: "chief-information-officer",      title: "Chief Information Officer (CIO)",    category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "chief-revenue-officer",          title: "Chief Revenue Officer (CRO)",        category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "chief-product-officer",          title: "Chief Product Officer (CPO)",        category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "general-manager",                title: "General Manager",                    category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "country-manager",                title: "Country Manager",                    category: "Executive & C-Suite", fixedLevel: "c-suite",          salarySlug: null },
      { slug: "regional-director",              title: "Regional Director",                  category: "Executive & C-Suite", fixedLevel: "director",         salarySlug: null },
    ],
  },
  {
    name: "Technology & Engineering",
    slug: "technology-engineering",
    titles: [
      { slug: "software-engineer",              title: "Software Engineer",                  category: "Technology & Engineering",                            salarySlug: "software-engineer" },
      { slug: "senior-software-engineer",       title: "Senior Software Engineer",           category: "Technology & Engineering", fixedLevel: "team-lead",   salarySlug: "senior-software-engineer" },
      { slug: "staff-principal-software-engineer", title: "Staff / Principal Software Engineer", category: "Technology & Engineering", fixedLevel: "team-lead", salarySlug: "senior-software-engineer" },
      { slug: "engineering-manager",            title: "Engineering Manager",                category: "Technology & Engineering", fixedLevel: "manager",     salarySlug: null },
      { slug: "vp-of-engineering",              title: "VP of Engineering",                  category: "Technology & Engineering", fixedLevel: "vice-president", salarySlug: null },
      { slug: "devops-engineer",                title: "DevOps Engineer",                    category: "Technology & Engineering",                            salarySlug: null },
      { slug: "site-reliability-engineer",      title: "Site Reliability Engineer",          category: "Technology & Engineering",                            salarySlug: null },
      { slug: "data-engineer",                  title: "Data Engineer",                      category: "Technology & Engineering",                            salarySlug: null },
      { slug: "data-scientist",                 title: "Data Scientist",                     category: "Technology & Engineering",                            salarySlug: "data-analyst" },
      { slug: "machine-learning-engineer",      title: "Machine Learning Engineer",          category: "Technology & Engineering",                            salarySlug: null },
      { slug: "ai-research-engineer",           title: "AI / Research Engineer",             category: "Technology & Engineering",                            salarySlug: null },
      { slug: "qa-test-engineer",               title: "QA / Test Engineer",                 category: "Technology & Engineering",                            salarySlug: null },
      { slug: "mobile-developer",               title: "Mobile Developer (iOS / Android)",   category: "Technology & Engineering",                            salarySlug: null },
      { slug: "frontend-developer",             title: "Frontend Developer",                 category: "Technology & Engineering",                            salarySlug: "software-engineer" },
      { slug: "backend-developer",              title: "Backend Developer",                  category: "Technology & Engineering",                            salarySlug: "software-engineer" },
      { slug: "full-stack-developer",           title: "Full-Stack Developer",               category: "Technology & Engineering",                            salarySlug: "software-engineer" },
      { slug: "solutions-architect",            title: "Solutions Architect",                category: "Technology & Engineering", fixedLevel: "team-lead",   salarySlug: null },
      { slug: "cloud-architect",                title: "Cloud Architect",                    category: "Technology & Engineering", fixedLevel: "team-lead",   salarySlug: null },
      { slug: "cybersecurity-analyst",          title: "Cybersecurity Analyst",              category: "Technology & Engineering",                            salarySlug: null },
      { slug: "cybersecurity-manager",          title: "Cybersecurity Manager",              category: "Technology & Engineering", fixedLevel: "manager",     salarySlug: null },
      { slug: "it-support-specialist",          title: "IT Support Specialist",              category: "Technology & Engineering",                            salarySlug: null },
      { slug: "it-manager",                     title: "IT Manager",                         category: "Technology & Engineering", fixedLevel: "manager",     salarySlug: null },
      { slug: "head-of-it",                     title: "Head of IT",                         category: "Technology & Engineering", fixedLevel: "director",    salarySlug: null },
    ],
  },
  {
    name: "Product & Design",
    slug: "product-design",
    titles: [
      { slug: "product-manager",                title: "Product Manager",                    category: "Product & Design",                                    salarySlug: "product-manager" },
      { slug: "senior-product-manager",         title: "Senior Product Manager",             category: "Product & Design", fixedLevel: "team-lead",           salarySlug: "product-manager" },
      { slug: "director-of-product",            title: "Director of Product",                category: "Product & Design", fixedLevel: "director",            salarySlug: "product-manager" },
      { slug: "vp-of-product",                  title: "VP of Product",                      category: "Product & Design", fixedLevel: "vice-president",      salarySlug: "product-manager" },
      { slug: "ux-designer",                    title: "UX Designer",                        category: "Product & Design",                                    salarySlug: "ui-ux-designer" },
      { slug: "ui-designer",                    title: "UI Designer",                        category: "Product & Design",                                    salarySlug: "ui-ux-designer" },
      { slug: "product-designer",               title: "Product Designer",                   category: "Product & Design",                                    salarySlug: "ui-ux-designer" },
      { slug: "design-manager",                 title: "Design Manager",                     category: "Product & Design", fixedLevel: "manager",             salarySlug: "ui-ux-designer" },
      { slug: "graphic-designer",               title: "Graphic Designer",                   category: "Product & Design",                                    salarySlug: "graphic-designer" },
      { slug: "creative-director",              title: "Creative Director",                  category: "Product & Design", fixedLevel: "director",            salarySlug: "graphic-designer" },
    ],
  },
  {
    name: "Finance & Accounting",
    slug: "finance-accounting",
    titles: [
      { slug: "accountant",                     title: "Accountant",                         category: "Finance & Accounting",                                salarySlug: "accountant" },
      { slug: "senior-accountant",              title: "Senior Accountant",                  category: "Finance & Accounting", fixedLevel: "team-lead",       salarySlug: "accountant" },
      { slug: "finance-manager",                title: "Finance Manager",                    category: "Finance & Accounting", fixedLevel: "manager",         salarySlug: "finance-manager" },
      { slug: "financial-controller",           title: "Financial Controller",               category: "Finance & Accounting", fixedLevel: "manager",         salarySlug: "finance-manager" },
      { slug: "fpa-analyst",                    title: "FP&A Analyst",                       category: "Finance & Accounting",                                salarySlug: "accountant" },
      { slug: "internal-auditor",               title: "Internal Auditor",                   category: "Finance & Accounting",                                salarySlug: "accountant" },
      { slug: "tax-manager",                    title: "Tax Manager",                        category: "Finance & Accounting", fixedLevel: "manager",         salarySlug: "finance-manager" },
      { slug: "treasury-manager",               title: "Treasury Manager",                   category: "Finance & Accounting", fixedLevel: "manager",         salarySlug: "finance-manager" },
      { slug: "investment-analyst",             title: "Investment Analyst",                 category: "Finance & Accounting",                                salarySlug: "accountant" },
      { slug: "investment-manager",             title: "Investment Manager",                 category: "Finance & Accounting", fixedLevel: "manager",         salarySlug: "finance-manager" },
      { slug: "vp-finance",                     title: "VP Finance",                         category: "Finance & Accounting", fixedLevel: "vice-president",  salarySlug: "finance-manager" },
      { slug: "finance-director",               title: "Finance Director",                   category: "Finance & Accounting", fixedLevel: "director",        salarySlug: "finance-manager" },
    ],
  },
  {
    name: "Sales & Business Development",
    slug: "sales-bd",
    titles: [
      { slug: "sales-representative",           title: "Sales Representative",               category: "Sales & Business Development",                        salarySlug: "sales-executive" },
      { slug: "account-executive",              title: "Account Executive",                  category: "Sales & Business Development",                        salarySlug: "sales-executive" },
      { slug: "senior-account-executive",       title: "Senior Account Executive",           category: "Sales & Business Development", fixedLevel: "team-lead", salarySlug: "sales-executive" },
      { slug: "sales-manager",                  title: "Sales Manager",                      category: "Sales & Business Development", fixedLevel: "manager", salarySlug: "sales-manager" },
      { slug: "regional-sales-manager",         title: "Regional Sales Manager",             category: "Sales & Business Development", fixedLevel: "manager", salarySlug: "sales-manager" },
      { slug: "head-of-sales",                  title: "Head of Sales",                      category: "Sales & Business Development", fixedLevel: "director", salarySlug: "sales-manager" },
      { slug: "vp-sales",                       title: "VP Sales",                           category: "Sales & Business Development", fixedLevel: "vice-president", salarySlug: "sales-manager" },
      { slug: "business-development-manager",   title: "Business Development Manager",       category: "Sales & Business Development", fixedLevel: "manager", salarySlug: "sales-manager" },
      { slug: "partnerships-manager",           title: "Partnerships Manager",               category: "Sales & Business Development", fixedLevel: "manager", salarySlug: "sales-manager" },
      { slug: "key-account-manager",            title: "Key Account Manager",                category: "Sales & Business Development",                        salarySlug: "sales-executive" },
    ],
  },
  {
    name: "Marketing & Communications",
    slug: "marketing-communications",
    titles: [
      { slug: "marketing-executive",            title: "Marketing Executive",                category: "Marketing & Communications",                          salarySlug: "digital-marketing-specialist" },
      { slug: "digital-marketing-specialist",   title: "Digital Marketing Specialist",       category: "Marketing & Communications",                          salarySlug: "digital-marketing-specialist" },
      { slug: "content-marketing-manager",      title: "Content Marketing Manager",          category: "Marketing & Communications", fixedLevel: "manager",   salarySlug: "marketing-manager" },
      { slug: "seo-specialist",                 title: "SEO Specialist",                     category: "Marketing & Communications",                          salarySlug: "digital-marketing-specialist" },
      { slug: "performance-marketing-manager",  title: "Performance Marketing Manager",      category: "Marketing & Communications", fixedLevel: "manager",   salarySlug: "marketing-manager" },
      { slug: "social-media-manager",           title: "Social Media Manager",               category: "Marketing & Communications", fixedLevel: "manager",   salarySlug: "marketing-manager" },
      { slug: "brand-manager",                  title: "Brand Manager",                      category: "Marketing & Communications", fixedLevel: "manager",   salarySlug: "marketing-manager" },
      { slug: "marketing-manager",              title: "Marketing Manager",                  category: "Marketing & Communications", fixedLevel: "manager",   salarySlug: "marketing-manager" },
      { slug: "head-of-marketing",              title: "Head of Marketing",                  category: "Marketing & Communications", fixedLevel: "director",  salarySlug: "marketing-manager" },
      { slug: "vp-marketing",                   title: "VP Marketing",                       category: "Marketing & Communications", fixedLevel: "vice-president", salarySlug: "marketing-manager" },
      { slug: "pr-manager",                     title: "PR Manager",                         category: "Marketing & Communications", fixedLevel: "manager",   salarySlug: "marketing-manager" },
      { slug: "communications-director",        title: "Communications Director",            category: "Marketing & Communications", fixedLevel: "director",  salarySlug: "marketing-manager" },
    ],
  },
  {
    name: "Human Resources & People",
    slug: "hr-people",
    titles: [
      { slug: "hr-coordinator",                 title: "HR Coordinator",                     category: "Human Resources & People",                            salarySlug: "hr-manager" },
      { slug: "hr-business-partner",            title: "HR Business Partner",                category: "Human Resources & People",                            salarySlug: "hr-manager" },
      { slug: "talent-acquisition-specialist",  title: "Talent Acquisition Specialist",      category: "Human Resources & People",                            salarySlug: "hr-manager" },
      { slug: "recruitment-manager",            title: "Recruitment Manager",                category: "Human Resources & People", fixedLevel: "manager",     salarySlug: "hr-manager" },
      { slug: "learning-development-manager",   title: "Learning & Development Manager",     category: "Human Resources & People", fixedLevel: "manager",     salarySlug: "hr-manager" },
      { slug: "compensation-benefits-manager",  title: "Compensation & Benefits Manager",    category: "Human Resources & People", fixedLevel: "manager",     salarySlug: "hr-manager" },
      { slug: "hr-manager",                     title: "HR Manager",                         category: "Human Resources & People", fixedLevel: "manager",     salarySlug: "hr-manager" },
      { slug: "head-of-people",                 title: "Head of People",                     category: "Human Resources & People", fixedLevel: "director",    salarySlug: "hr-manager" },
      { slug: "vp-people",                      title: "VP People",                          category: "Human Resources & People", fixedLevel: "vice-president", salarySlug: "hr-manager" },
    ],
  },
  {
    name: "Operations & Supply Chain",
    slug: "operations-supply-chain",
    titles: [
      { slug: "operations-analyst",             title: "Operations Analyst",                 category: "Operations & Supply Chain",                           salarySlug: "operations-manager" },
      { slug: "operations-manager",             title: "Operations Manager",                 category: "Operations & Supply Chain", fixedLevel: "manager",    salarySlug: "operations-manager" },
      { slug: "head-of-operations",             title: "Head of Operations",                 category: "Operations & Supply Chain", fixedLevel: "director",   salarySlug: "operations-manager" },
      { slug: "vp-operations",                  title: "VP Operations",                      category: "Operations & Supply Chain", fixedLevel: "vice-president", salarySlug: "operations-manager" },
      { slug: "supply-chain-manager",           title: "Supply Chain Manager",               category: "Operations & Supply Chain", fixedLevel: "manager",    salarySlug: "operations-manager" },
      { slug: "logistics-manager",              title: "Logistics Manager",                  category: "Operations & Supply Chain", fixedLevel: "manager",    salarySlug: "operations-manager" },
      { slug: "procurement-manager",            title: "Procurement Manager",                category: "Operations & Supply Chain", fixedLevel: "manager",    salarySlug: "operations-manager" },
      { slug: "warehouse-manager",              title: "Warehouse Manager",                  category: "Operations & Supply Chain", fixedLevel: "manager",    salarySlug: "operations-manager" },
    ],
  },
  {
    name: "Legal & Compliance",
    slug: "legal-compliance",
    titles: [
      { slug: "legal-counsel",                  title: "Legal Counsel",                      category: "Legal & Compliance",                                  salarySlug: "lawyer" },
      { slug: "senior-legal-counsel",           title: "Senior Legal Counsel",               category: "Legal & Compliance", fixedLevel: "team-lead",         salarySlug: "lawyer" },
      { slug: "compliance-officer",             title: "Compliance Officer",                 category: "Legal & Compliance",                                  salarySlug: "lawyer" },
      { slug: "compliance-manager",             title: "Compliance Manager",                 category: "Legal & Compliance", fixedLevel: "manager",           salarySlug: "lawyer" },
      { slug: "general-counsel",                title: "General Counsel",                    category: "Legal & Compliance", fixedLevel: "director",          salarySlug: "lawyer" },
    ],
  },
  {
    name: "Consulting & Strategy",
    slug: "consulting-strategy",
    titles: [
      { slug: "business-analyst",               title: "Business Analyst",                   category: "Consulting & Strategy",                               salarySlug: "data-analyst" },
      { slug: "management-consultant",          title: "Management Consultant",              category: "Consulting & Strategy",                               salarySlug: null },
      { slug: "senior-consultant",              title: "Senior Consultant",                  category: "Consulting & Strategy", fixedLevel: "team-lead",      salarySlug: null },
      { slug: "strategy-manager",               title: "Strategy Manager",                   category: "Consulting & Strategy", fixedLevel: "manager",        salarySlug: null },
      { slug: "director-of-strategy",           title: "Director of Strategy",               category: "Consulting & Strategy", fixedLevel: "director",       salarySlug: null },
    ],
  },
  {
    name: "Construction & Real Estate",
    slug: "construction-real-estate",
    titles: [
      { slug: "civil-engineer",                 title: "Civil Engineer",                     category: "Construction & Real Estate",                          salarySlug: "civil-engineer" },
      { slug: "mechanical-engineer",            title: "Mechanical Engineer",                category: "Construction & Real Estate",                          salarySlug: "mechanical-engineer" },
      { slug: "electrical-engineer",            title: "Electrical Engineer",                category: "Construction & Real Estate",                          salarySlug: "civil-engineer" },
      { slug: "project-engineer",               title: "Project Engineer",                   category: "Construction & Real Estate",                          salarySlug: "civil-engineer" },
      { slug: "site-engineer",                  title: "Site Engineer",                      category: "Construction & Real Estate",                          salarySlug: "civil-engineer" },
      { slug: "construction-manager",           title: "Construction Manager",               category: "Construction & Real Estate", fixedLevel: "manager",   salarySlug: "construction-manager" },
      { slug: "project-manager-construction",   title: "Project Manager (Construction)",     category: "Construction & Real Estate", fixedLevel: "manager",   salarySlug: "project-manager" },
      { slug: "real-estate-agent",              title: "Real Estate Agent",                  category: "Construction & Real Estate",                          salarySlug: null },
      { slug: "property-manager",               title: "Property Manager",                   category: "Construction & Real Estate", fixedLevel: "manager",   salarySlug: null },
      { slug: "facilities-manager",             title: "Facilities Manager",                 category: "Construction & Real Estate", fixedLevel: "manager",   salarySlug: "operations-manager" },
    ],
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    titles: [
      { slug: "registered-nurse",               title: "Registered Nurse",                   category: "Healthcare",                                          salarySlug: "nurse" },
      { slug: "general-practitioner",           title: "General Practitioner",               category: "Healthcare",                                          salarySlug: "doctor" },
      { slug: "medical-specialist-consultant",  title: "Medical Specialist / Consultant",    category: "Healthcare",                                          salarySlug: "doctor" },
      { slug: "pharmacist",                     title: "Pharmacist",                         category: "Healthcare",                                          salarySlug: null },
      { slug: "hospital-administrator",         title: "Hospital Administrator",             category: "Healthcare", fixedLevel: "manager",                   salarySlug: null },
      { slug: "medical-director",               title: "Medical Director",                   category: "Healthcare", fixedLevel: "director",                  salarySlug: "doctor" },
    ],
  },
  {
    name: "Hospitality & Retail",
    slug: "hospitality-retail",
    titles: [
      { slug: "receptionist",                   title: "Receptionist",                       category: "Hospitality & Retail",                                salarySlug: "receptionist" },
      { slug: "guest-relations-manager",        title: "Guest Relations Manager",            category: "Hospitality & Retail", fixedLevel: "manager",         salarySlug: null },
      { slug: "food-beverage-manager",          title: "Food & Beverage Manager",            category: "Hospitality & Retail", fixedLevel: "manager",         salarySlug: null },
      { slug: "hotel-manager",                  title: "Hotel Manager",                      category: "Hospitality & Retail", fixedLevel: "manager",         salarySlug: null },
      { slug: "retail-store-manager",           title: "Retail Store Manager",               category: "Hospitality & Retail", fixedLevel: "manager",         salarySlug: null },
      { slug: "retail-area-manager",            title: "Retail Area Manager",                category: "Hospitality & Retail", fixedLevel: "senior-manager",  salarySlug: null },
    ],
  },
  {
    name: "Education",
    slug: "education",
    titles: [
      { slug: "teacher-k12",                    title: "Teacher (K-12)",                     category: "Education",                                           salarySlug: "teacher" },
      { slug: "school-administrator",           title: "School Administrator",               category: "Education", fixedLevel: "manager",                   salarySlug: null },
      { slug: "university-lecturer",            title: "University Lecturer",                category: "Education",                                           salarySlug: "teacher" },
      { slug: "head-of-school-principal",       title: "Head of School / Principal",         category: "Education", fixedLevel: "director",                  salarySlug: null },
    ],
  },
  {
    name: "Administration & Support",
    slug: "administration-support",
    titles: [
      { slug: "executive-assistant",            title: "Executive Assistant",                category: "Administration & Support",                            salarySlug: "executive-assistant" },
      { slug: "office-manager",                 title: "Office Manager",                     category: "Administration & Support", fixedLevel: "manager",     salarySlug: null },
      { slug: "customer-service-representative", title: "Customer Service Representative",   category: "Administration & Support",                            salarySlug: "customer-service-rep" },
      { slug: "customer-success-manager",       title: "Customer Success Manager",           category: "Administration & Support", fixedLevel: "manager",     salarySlug: null },
      { slug: "head-of-customer-success",       title: "Head of Customer Success",           category: "Administration & Support", fixedLevel: "director",    salarySlug: null },
    ],
  },
];

/** Flat array of all titles — useful for lookups. */
export const ALL_JOB_TITLES: JobTitle[] = JOB_CATEGORIES.flatMap(
  (cat) => cat.titles
);

/** O(1) lookup by slug. */
const _titleBySlug = new Map<string, JobTitle>(
  ALL_JOB_TITLES.map((t) => [t.slug, t])
);
export function getJobTitleBySlug(slug: string): JobTitle | undefined {
  return _titleBySlug.get(slug);
}

/**
 * Returns the auto-detected leadership level for a title slug, or null if the
 * dropdown should be shown and the user picks manually.
 */
export function getAutoLeadershipLevel(slug: string): LeadershipLevel | null {
  return _titleBySlug.get(slug)?.fixedLevel ?? null;
}

/** Total title count — used in marketing copy. */
export const TITLE_COUNT = ALL_JOB_TITLES.length;
