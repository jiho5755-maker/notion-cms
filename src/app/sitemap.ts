import type { MetadataRoute } from "next";
import { getTutorials, getCombos, getSeasons } from "@/lib/notion";

/**
 * 사이트맵 생성
 *
 * 정적 페이지 + 동적 페이지(Notion 데이터 기반)를 포함한다.
 * Next.js App Router가 /sitemap.xml로 자동 서빙한다.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pressco21.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Notion 데이터 조회 (병렬) ──
  const [tutorials, combos, seasons] = await Promise.all([
    getTutorials(),
    getCombos(),
    getSeasons(),
  ]);

  // ── 정적 페이지 ──
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tutorials`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/combos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/seasons`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 정적 페이지 (Wave 3 고급 기능)
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ── 동적 페이지 (Notion 데이터 기반) ──
  const tutorialPages = tutorials.map((t) => ({
    url: `${SITE_URL}/tutorials/${t.slug}`,
    lastModified: new Date(t.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const comboPages = combos.map((c) => ({
    url: `${SITE_URL}/combos/${c.id}`,
    lastModified: new Date(c.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const seasonPages = seasons.map((s) => ({
    url: `${SITE_URL}/seasons/${s.slug}`,
    lastModified: new Date(s.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...tutorialPages,
    ...comboPages,
    ...seasonPages,
  ];
}
