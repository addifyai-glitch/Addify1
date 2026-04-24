import type { MetadataRoute } from "next";
import { ROLE_SLUGS, CITY_SLUGS } from "@/lib/salary";

const BASE_URL = "https://addify.ae";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/salary`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const salaryRoutes: MetadataRoute.Sitemap = ROLE_SLUGS.flatMap((jobSlug) =>
    CITY_SLUGS.map((citySlug) => ({
      url: `${BASE_URL}/salary/${jobSlug}/${citySlug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticRoutes, ...salaryRoutes];
}
