import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

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
