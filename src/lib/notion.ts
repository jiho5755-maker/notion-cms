// ============================================================
// PRESSCO 21 — NotCMS 데이터 페칭 함수
// 노션 CMS에서 콘텐츠를 조회하는 서버 사이드 유틸리티.
// ISR 캐싱은 unstable_cache를 통해 적용한다.
// ============================================================

import { unstable_cache } from "next/cache";
import { getNotCmsClient } from "@/notcms/schema";
import type { Tutorial, Combo, Season, Category } from "@/types";

// ------------------------------------------------------------
// 내부 헬퍼: NotCMS 응답을 안전하게 언래핑
// ------------------------------------------------------------

/**
 * NotCMS의 [data, error, response] 튜플에서 데이터를 추출한다.
 * 에러 발생 시 빈 배열 또는 null을 반환하여 페이지 렌더링을 중단하지 않는다.
 */
function unwrapList<T>(
  result: readonly [T[] | undefined, Error | null, Response | undefined],
): T[] {
  const [data, error] = result;
  if (error) {
    console.error("[NotCMS] 목록 조회 실패:", error.message);
    return [];
  }
  return data ?? [];
}

function unwrapPage<T>(
  result: readonly [T | undefined, Error | null, Response | undefined],
): T | null {
  const [data, error] = result;
  if (error) {
    console.error("[NotCMS] 상세 조회 실패:", error.message);
    return null;
  }
  return data ?? null;
}

// ------------------------------------------------------------
// 튜토리얼 (Tutorials)
// ------------------------------------------------------------

/**
 * 발행된 튜토리얼 목록을 조회한다.
 * ISR: 1시간(3600초) 캐싱
 */
export const getTutorials = unstable_cache(
  async (): Promise<Tutorial[]> => {
    const nc = getNotCmsClient();
    if (!nc) return [];

    const result = await nc.query.tutorials.list();
    const pages = unwrapList(result);

    // published가 true인 항목만 필터링
    return pages
      .filter((page) => page.properties.published === true)
      .map((page) => ({
        id: page.id,
        title: page.title ?? page.properties.title ?? "",
        slug: page.properties.slug ?? "",
        category: page.properties.category ?? "",
        difficulty: (page.properties.difficulty ?? "beginner") as Tutorial["difficulty"],
        duration: page.properties.duration ?? "",
        youtubeUrl: page.properties.youtubeUrl ?? "",
        coverImage: page.properties.coverImage?.[0] ?? "",
        excerpt: page.properties.excerpt ?? "",
        published: page.properties.published ?? false,
        materials: [], // relation 데이터는 별도 조회 필요
        createdAt: "",
      }));
  },
  ["tutorials-list"],
  { revalidate: 3600 },
);

/**
 * 슬러그로 튜토리얼 상세를 조회한다.
 * 목록에서 슬러그로 ID를 찾은 뒤 개별 페이지를 가져온다.
 * ISR: 10분(600초) 캐싱
 */
export const getTutorialBySlug = unstable_cache(
  async (slug: string): Promise<(Tutorial & { content: string }) | null> => {
    const nc = getNotCmsClient();
    if (!nc) return null;

    // 먼저 목록에서 슬러그에 해당하는 페이지 ID를 찾는다
    const listResult = await nc.query.tutorials.list();
    const pages = unwrapList(listResult);

    const target = pages.find((page) => page.properties.slug === slug);
    if (!target) {
      console.warn(`[NotCMS] 튜토리얼을 찾을 수 없음: slug=${slug}`);
      return null;
    }

    // 개별 페이지 조회 (content 포함)
    const pageResult = await nc.query.tutorials.get(target.id);
    const page = unwrapPage(pageResult);
    if (!page) return null;

    return {
      id: page.id,
      title: page.title ?? page.properties.title ?? "",
      slug: page.properties.slug ?? "",
      category: page.properties.category ?? "",
      difficulty: (page.properties.difficulty ?? "beginner") as Tutorial["difficulty"],
      duration: page.properties.duration ?? "",
      youtubeUrl: page.properties.youtubeUrl ?? "",
      coverImage: page.properties.coverImage?.[0] ?? "",
      excerpt: page.properties.excerpt ?? "",
      published: page.properties.published ?? false,
      materials: [],
      createdAt: "",
      content: page.content ?? "",
    };
  },
  ["tutorial-detail"],
  { revalidate: 600 },
);

// ------------------------------------------------------------
// 재료 조합 가이드 (Combos)
// ------------------------------------------------------------

/**
 * 발행된 재료 조합 가이드 목록을 조회한다.
 * ISR: 1시간(3600초) 캐싱
 */
export const getCombos = unstable_cache(
  async (): Promise<Combo[]> => {
    const nc = getNotCmsClient();
    if (!nc) return [];

    const result = await nc.query.combos.list();
    const pages = unwrapList(result);

    return pages
      .filter((page) => page.properties.published === true)
      .map((page) => ({
        id: page.id,
        title: page.title ?? page.properties.title ?? "",
        difficulty: (page.properties.difficulty ?? "beginner") as Combo["difficulty"],
        thumbnails: page.properties.thumbnails ?? [],
        excerpt: page.properties.excerpt ?? "",
        published: page.properties.published ?? false,
        materials: [],
        tutorials: [],
        createdAt: "",
      }));
  },
  ["combos-list"],
  { revalidate: 3600 },
);

/**
 * ID로 재료 조합 상세를 조회한다.
 * ISR: 10분(600초) 캐싱
 */
export const getComboById = unstable_cache(
  async (id: string): Promise<(Combo & { content: string }) | null> => {
    const nc = getNotCmsClient();
    if (!nc) return null;

    const result = await nc.query.combos.get(id);
    const page = unwrapPage(result);
    if (!page) return null;

    return {
      id: page.id,
      title: page.title ?? page.properties.title ?? "",
      difficulty: (page.properties.difficulty ?? "beginner") as Combo["difficulty"],
      thumbnails: page.properties.thumbnails ?? [],
      excerpt: page.properties.excerpt ?? "",
      published: page.properties.published ?? false,
      materials: [],
      tutorials: [],
      createdAt: "",
      content: page.content ?? "",
    };
  },
  ["combo-detail"],
  { revalidate: 600 },
);

// ------------------------------------------------------------
// 시즌 캠페인 (Seasons)
// ------------------------------------------------------------

/**
 * 발행된 시즌 캠페인 목록을 조회한다.
 * ISR: 1시간(3600초) 캐싱
 */
export const getSeasons = unstable_cache(
  async (): Promise<Season[]> => {
    const nc = getNotCmsClient();
    if (!nc) return [];

    const result = await nc.query.seasons.list();
    const pages = unwrapList(result);

    return pages
      .filter((page) => page.properties.published === true)
      .map((page) => ({
        id: page.id,
        title: page.title ?? page.properties.title ?? "",
        slug: page.properties.slug ?? "",
        period: page.properties.period ?? "",
        heroImage: page.properties.heroImage?.[0] ?? "",
        excerpt: page.properties.excerpt ?? "",
        published: page.properties.published ?? false,
        tutorials: [],
        createdAt: "",
      }));
  },
  ["seasons-list"],
  { revalidate: 3600 },
);

/**
 * 슬러그로 시즌 캠페인 상세를 조회한다.
 * ISR: 10분(600초) 캐싱
 */
export const getSeasonBySlug = unstable_cache(
  async (slug: string): Promise<(Season & { content: string }) | null> => {
    const nc = getNotCmsClient();
    if (!nc) return null;

    const listResult = await nc.query.seasons.list();
    const pages = unwrapList(listResult);

    const target = pages.find((page) => page.properties.slug === slug);
    if (!target) {
      console.warn(`[NotCMS] 시즌 캠페인을 찾을 수 없음: slug=${slug}`);
      return null;
    }

    const pageResult = await nc.query.seasons.get(target.id);
    const page = unwrapPage(pageResult);
    if (!page) return null;

    return {
      id: page.id,
      title: page.title ?? page.properties.title ?? "",
      slug: page.properties.slug ?? "",
      period: page.properties.period ?? "",
      heroImage: page.properties.heroImage?.[0] ?? "",
      excerpt: page.properties.excerpt ?? "",
      published: page.properties.published ?? false,
      tutorials: [],
      createdAt: "",
      content: page.content ?? "",
    };
  },
  ["season-detail"],
  { revalidate: 600 },
);

// ------------------------------------------------------------
// 카테고리 (Categories)
// ------------------------------------------------------------

/**
 * 카테고리 목록을 조회한다. order 순으로 정렬.
 * ISR: 1시간(3600초) 캐싱
 */
export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const nc = getNotCmsClient();
    if (!nc) return [];

    const result = await nc.query.categories.list();
    const pages = unwrapList(result);

    return pages
      .map((page) => ({
        id: page.id,
        title: page.title ?? page.properties.title ?? "",
        slug: page.properties.slug ?? "",
        icon: page.properties.icon ?? "",
        order: page.properties.order ?? 0,
      }))
      .sort((a, b) => a.order - b.order);
  },
  ["categories-list"],
  { revalidate: 3600 },
);
