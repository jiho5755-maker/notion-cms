import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pressco21.vercel.app",
  ),
  title: {
    default: "PRESSCO 21 — 꽃으로 노는 모든 방법",
    template: "%s | PRESSCO 21",
  },
  description:
    "압화(pressed flower) 전문 — 재료, 도구, 만들기 키트, 교육. 튜토리얼, 재료 조합 가이드, B2B 카탈로그까지.",
  openGraph: {
    siteName: "PRESSCO 21",
    locale: "ko_KR",
    type: "website",
  },
};

/** Organization JSON-LD 구조화 데이터 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PRESSCO 21",
  alternateName: "프레스코21",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pressco21.vercel.app",
  description: "압화(pressed flower) 전문 콘텐츠 허브 — 꽃으로 노는 모든 방법",
  sameAs: ["https://www.foreverlove.co.kr"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
