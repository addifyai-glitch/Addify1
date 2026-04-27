import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";
import { CookieConsent } from "@/components/legal/cookie-consent";
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
  title: "Addify. Gulf Careers, Clarified.",
  description:
    "Salary benchmarks and job fit scores for UAE and GCC job seekers. Find out what your role pays and whether a job is right for you.",
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
          </RecaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
