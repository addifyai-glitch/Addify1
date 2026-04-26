export type Job = {
  id: string;
  title: string;
  company: string;
  city: string;
  country: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  experience_level?: string;
  apply_url: string;
  description?: string;
  featured: boolean;
  posted_at: string;
  expires_at: string;
  source: "admin" | "user_submission";
};
