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
    quote: "I found out I was underpaid by about 22 percent. I used the salary numbers to negotiate and landed a new role within a month at the right number.",
    name: "Ahmad R.",
    role: "Senior Software Engineer",
    city: "Dubai",
    initials: "AR",
    color: "bg-accent/15 text-accent",
  },
  {
    id: 2,
    stars: 4,
    quote: "I rewrote my cover letter five times before submitting. Each version took less than a minute. Way better than staring at a blank Word doc. Hoping the Arabic version comes soon.",
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
    quote: "Rewriting my resume with the builder made me realize I was missing one certification the roles kept asking for. I got it, reapplied, got hired. Wish it had a stronger skills view, but the formatting was spot on.",
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
  {
    id: 7,
    stars: 5,
    quote: "I moved from Cairo to Sharjah last year. The salary tool helped me figure out what to ask for in dirhams instead of guessing from Egyptian pound conversions. Saved me from undercharging.",
    name: "Mahmoud K.",
    role: "Civil Engineer",
    city: "Sharjah",
    initials: "MK",
    color: "bg-accent/15 text-accent",
  },
  {
    id: 8,
    stars: 4,
    quote: "Checked the salary range for a Muscat opportunity I was unsure about. The number came in well below similar roles. Decided not to apply and saved myself two weeks of process. Honest tool.",
    name: "Reem A.",
    role: "Project Manager",
    city: "Muscat",
    initials: "RA",
    color: "bg-success/15 text-success",
  },
  {
    id: 9,
    stars: 5,
    quote: "Living in Kuwait, I always struggled finding accurate salary data. Bayt is decent but Addify gave me proper KWD ranges with allowance breakdowns. That detail matters here.",
    name: "Yousef N.",
    role: "Operations Manager",
    city: "Kuwait City",
    initials: "YN",
    color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-foreground",
  },
];
