import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CookieSettingsLink } from "@/components/legal/cookie-consent";


const columns = [
  {
    heading: "Product",
    links: [
      { label: "Salary Check", href: "/salary" },
      { label: "All Tools", href: "/tools" },
      { label: "Jobs", href: "/jobs" },
      { label: "Post a Job", href: "/submit-job" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Salary Guides", href: "/blog" },
      { label: "Research", href: "/research" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Data & Trust",
    links: [
      { label: "Methodology", href: "/methodology" },
      { label: "Data Sources", href: "/data-sources" },
      { label: "About Our Data", href: "/about-our-data" },
      { label: "Editorial Policy", href: "/editorial-policy" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <Container className="py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          {/* Column 1 — Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1 mb-3">
              <span className="font-display text-xl text-foreground">Addify</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent mb-1 ml-0.5" />
            </Link>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Gulf Careers, Clarified.
            </p>
          </div>

          {/* Columns 2-4 */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground mb-4">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/75 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Addify. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <CookieSettingsLink />
          </div>
        </div>
      </Container>
    </footer>
  );
}
