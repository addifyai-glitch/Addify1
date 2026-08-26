export type Job = {
  id: string;
  wp_id?: string | null;
  slug?: string | null;
  title: string;
  company?: string | null;
  city: string;
  country: string;
  category?: string | null;
  sector?: string | null;
  employment_type?: string | null;
  experience_level?: string | null;
  experience_label?: string | null;
  qualification?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  apply_url: string;
  apply_type?: string | null;
  description?: string | null;
  address?: string | null;
  is_featured?: boolean;
  is_filled?: boolean;
  approved?: boolean;
  source: "admin" | "user_submission" | "wordpress_migration";
  posted_at: string;
  modified_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Set only when lib/discriminatory-language-guard.mjs fires at write
  // time. Null on every pre-existing row (no backfill) and on every row
  // where the guard never matched.
  flagged_reasons?: {
    field: string;
    label: string;
    matchedText: string;
    context: string;
  }[] | null;
};
