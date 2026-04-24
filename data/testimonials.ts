// PLACEHOLDER TESTIMONIALS — replace with real user quotes before launch.
// Collect via the /share-story form once published.

export type Testimonial = {
  id: number;
  stars: number;
  quote: string;
  name: string;
  role: string;
  city: string;
  initials: string;
  color: string; // Tailwind bg class
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    stars: 5,
    quote: "Found out I was underpaid by 22%. Used the fit score to land a new role at the right salary within a month.",
    name: "Ahmad R.",
    role: "Senior Software Engineer",
    city: "Dubai",
    initials: "AR",
    color: "bg-accent/15 text-accent",
  },
  {
    id: 2,
    stars: 5,
    quote: "The cover letter tool saved me hours. Tailored output that actually sounds like me — not a generic template.",
    name: "Priya S.",
    role: "Marketing Manager",
    city: "Abu Dhabi",
    initials: "PS",
    color: "bg-success/15 text-success",
  },
  {
    id: 3,
    stars: 5,
    quote: "Finally a salary tool that understands housing allowance and visa realities. Bayt and Glassdoor don't come close.",
    name: "Omar K.",
    role: "Finance Director",
    city: "Riyadh",
    initials: "OK",
    color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-foreground",
  },
  {
    id: 4,
    stars: 5,
    quote: "I was about to accept an offer AED 8,000 below market. Addify's benchmark let me negotiate up confidently.",
    name: "Sarah M.",
    role: "Product Manager",
    city: "Dubai",
    initials: "SM",
    color: "bg-accent/15 text-accent",
  },
  {
    id: 5,
    stars: 5,
    quote: "Clean, fast, no nonsense. The fit score told me I was missing one certification — got it, got hired.",
    name: "Hassan A.",
    role: "Cybersecurity Analyst",
    city: "Doha",
    initials: "HA",
    color: "bg-success/15 text-success",
  },
  {
    id: 6,
    stars: 5,
    quote: "Free, useful, and actually built for people working in the Gulf. Rare combination.",
    name: "Fatima B.",
    role: "HR Business Partner",
    city: "Manama",
    initials: "FB",
    color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-foreground",
  },
];
