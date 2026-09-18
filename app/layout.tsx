import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

// Sitewide identity + search entry point — every page carries this, not just
// the homepage, so any crawler that lands on a blog post or tool page
// without ever hitting "/" still gets an Organization/WebSite anchor.
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Addify",
  url: "https://addify.ae",
  // No logo field: no logo image file is actually shipped (the header
  // renders a text wordmark, not an image) — a broken URL here is worse
  // than omitting an optional field.
  description:
    "Gulf career platform with real salary data and free career tools for professionals in UAE, Saudi Arabia, and the wider GCC.",
  areaServed: ["AE", "SA", "QA", "KW", "BH", "OM"],
};

// No SearchAction: /salary (the only plausible target) doesn't read a query
// param today, so a SearchAction here would point at a URL that doesn't
// actually search anything. Add it back once real query-param search ships.
const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Addify",
  url: "https://addify.ae",
};

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://addify.ae"),
  title: {
    default: "Addify. Gulf Careers, Clarified.",
    template: "%s | Addify",
  },
  description:
    "Salary benchmarks and free career tools for UAE and GCC job seekers. Find out what your role pays and get a Gulf-ready resume or cover letter in minutes.",
  // Fallback for any route that doesn't declare its own openGraph/twitter —
  // Next replaces this object wholesale on routes that set their own, so
  // this only ever applies where nothing more specific exists.
  openGraph: {
    type: "website",
    siteName: "Addify.ae",
    locale: "en_AE",
    title: "Addify. Gulf Careers, Clarified.",
    description:
      "Salary benchmarks and free career tools for UAE and GCC job seekers.",
    url: "https://addify.ae",
    images: [{ url: "/api/og/default", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Addify. Gulf Careers, Clarified.",
    description:
      "Salary benchmarks and free career tools for UAE and GCC job seekers.",
    images: ["/api/og/default"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      {process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "false" && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <JsonLd data={[organizationLd, websiteLd]} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <RecaptchaProvider>
            {children}
            <CookieConsent />
            <GoogleAnalytics />
          </RecaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
