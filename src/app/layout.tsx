import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import ThemeProvider from "@/components/theme/ThemeProvider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://educraft.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Educraft — Five Paths. One Learning Ecosystem.",
    template: "%s",
  },
  description:
    "A global digital education platform unifying linguistics, inclusive education, wellbeing, AI & digital technologies, and NEET/JEE preparation under one trust umbrella.",
  icons: {
    icon: "/logo.svg",
  },
  other: {
    // Tell the browser the page supports both schemes so it never auto-inverts it
    "color-scheme": "light dark",
  },
  openGraph: {
    title: "Educraft — Five Paths. One Learning Ecosystem.",
    description:
      "Global digital education platform with 5 distinct verticals: Linguistics, Inclusive Education, Wellbeing, AI & Digital Tech, NEET & JEE.",
    type: "website",
    siteName: "Educraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "Educraft — Five Paths. One Learning Ecosystem.",
    description:
      "Global digital education platform with 5 distinct verticals under one trust umbrella.",
  },
};

/** Organization structured data (plan §46) — site-wide. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Educraft",
  description:
    "Global digital education platform with five interconnected learning verticals: linguistics, inclusive education, wellbeing, AI & digital technologies, and NEET/JEE preparation.",
  url: SITE_URL,
  email: "hello@educraft.com",
  telephone: "+918045678900",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressCountry: "IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${manrope.variable} antialiased bg-background text-foreground font-[family-name:var(--font-manrope)]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
