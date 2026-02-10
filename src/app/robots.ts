import type { MetadataRoute } from "next";

/**
 * robots.txt 생성
 *
 * 검색엔진 크롤러에게 허용/차단 경로를 알린다.
 * Next.js App Router가 /robots.txt로 자동 서빙한다.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pressco21.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
