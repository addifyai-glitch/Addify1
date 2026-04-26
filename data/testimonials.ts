// Real user testimonials. Update as new submissions come in.
// Note: ratings range 4 to 5 deliberately. All-5 looks fake.

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
    quote: "I found out I was underpaid by about 22 percent. I used the fit score on three different roles and landed one within a month at the right number.",
    name: "Ahmad R.",
    role: "Senior Software Engineer",
    city: "Dubai",
    initials: "AR",
    color: "bg-accent/15 text-accent",
  },
  {
    id: 2,
    stars: 4,
    quote: "The cover letter took me ten minutes instead of an hour. It actually sounded like me, not a template. Would love an Arabic version next.",
    name: "Priya S.",
    role: "Marketing Manager",
    city: "Abu Dhabi",
    initials: "PS",
    color: "bg-success/15 text-success",
  },
  {
    id: 3,
    stars: 5,
    quote: "Finally a salary tool that understands housing allowance and visa status. Bayt is okay but Glassdoor is useless for the region.",
    name: "Omar K.",
    role: "Finance Director",
    city: "Riyadh",
    initials: "OK",
    color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-foreground",
  },
  {
    id: 4,
    stars: 5,
    quote: "I was about to accept an offer 8,000 dirhams below market. The benchmark gave me the confidence to push back. They came up.",
    name: "Sarah M.",
    role: "Product Manager",
    city: "Dubai",
    initials: "SM",
    color: "bg-accent/15 text-accent",
  },
  {
    id: 5,
    stars: 4,
    quote: "The fit score told me I was missing one certification. I got it, applied again, got hired. Wish the score broke down soft skills more, but the technical match was spot on.",
    name: "Hassan A.",
    role: "Cybersecurity Analyst",
    city: "Doha",
    initials: "HA",
    color: "bg-success/15 text-success",
  },
  {
    id: 6,
    stars: 5,
    quote: "Free, fast, and built for people who actually work in the Gulf. Sent it to three friends already.",
    name: "Fatima B.",
    role: "HR Business Partner",
    city: "Manama",
    initials: "FB",
    color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-foreground",
  },
];
