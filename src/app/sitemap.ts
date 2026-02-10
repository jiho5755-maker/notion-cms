import type { MetadataRoute } from "next";

/**
 * 사이트맵 생성
 *
 * 정적 페이지 + 동적 페이지(NotCMS 연동 후 추가 예정)를 포함한다.
 * Next.js App Router가 /sitemap.xml로 자동 서빙한다.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pressco21.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
  ];

  // ── 동적 페이지 (TODO: NotCMS 연동 후 구현) ──
  // NotCMS에서 튜토리얼 목록을 가져와 /tutorials/[slug] URL 생성
  // const tutorials = await fetchTutorials();
  // const tutorialPages = tutorials.map((t) => ({
  //   url: `${SITE_URL}/tutorials/${t.slug}`,
  //   lastModified: new Date(t.updatedAt),
  //   changeFrequency: "weekly" as const,
  //   priority: 0.7,
  // }));

  // NotCMS에서 재료 조합 목록을 가져와 /combos/[id] URL 생성
  // const combos = await fetchCombos();
  // const comboPages = combos.map((c) => ({
  //   url: `${SITE_URL}/combos/${c.id}`,
  //   lastModified: new Date(c.updatedAt),
  //   changeFrequency: "weekly" as const,
  //   priority: 0.6,
  // }));

  // NotCMS에서 시즌 캠페인 목록을 가져와 /seasons/[slug] URL 생성
  // const seasons = await fetchSeasons();
  // const seasonPages = seasons.map((s) => ({
  //   url: `${SITE_URL}/seasons/${s.slug}`,
  //   lastModified: new Date(s.updatedAt),
  //   changeFrequency: "monthly" as const,
  //   priority: 0.8,
  // }));

  return [
    ...staticPages,
    // ...tutorialPages,
    // ...comboPages,
    // ...seasonPages,
  ];
}
