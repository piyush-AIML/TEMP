import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Educraft — Empowering Schools, Empowering Students",
  description:
    "A global digital education platform unifying linguistics, inclusive education, psychological counseling, AI & digital technologies, and NEET/JEE preparation under one trust umbrella.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Educraft — Empowering Schools, Empowering Students",
    description:
      "Global digital education platform with 5 distinct verticals: Linguistics, Inclusive Education, Wellbeing, AI & Digital Tech, NEET & JEE.",
    type: "website",
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
        className={`${sora.variable} ${manrope.variable} antialiased bg-white text-ec-ink font-[family-name:var(--font-manrope)]`}
      >
        {children}
      </body>
    </html>
  );
}
