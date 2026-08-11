import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CookieSettingsLink } from "@/components/legal/cookie-consent";

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.262 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

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
            {/* Socials */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
              >
                <XIcon size={14} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
              >
                <LinkedInIcon size={14} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
              >
                <InstagramIcon size={14} />
              </a>
            </div>
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
