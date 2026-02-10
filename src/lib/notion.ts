// ============================================================
// PRESSCO 21 — Notion Official SDK 데이터 페칭 함수
// Notion Official API로 콘텐츠를 조회하는 서버 사이드 유틸리티.
// ISR 캐싱은 unstable_cache를 통해 적용한다.
// ============================================================

import { unstable_cache } from "next/cache";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type {
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { Tutorial, Combo, Season, Category } from "@/types";

// ------------------------------------------------------------
// Notion 클라이언트 초기화
// ------------------------------------------------------------

function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[Notion] NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }

  return new Client({ auth: process.env.NOTION_TOKEN });
}

function getN2M(): NotionToMarkdown {
  const client = getNotionClient();
  return new NotionToMarkdown({ notionClient: client });
}

// ------------------------------------------------------------
// 내부 헬퍼: Notion 속성 추출
// ------------------------------------------------------------

/**
 * Notion 페이지 속성에서 타입별로 값을 안전하게 추출한다.
 */
function getProp(
  page: PageObjectResponse,
  key: string,
): string | number | boolean | string[] {
  const prop = page.properties[key];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return prop.title[0]?.plain_text ?? "";
    case "rich_text":
      return prop.rich_text[0]?.plain_text ?? "";
    case "select":
      return prop.select?.name ?? "";
    case "multi_select":
      return prop.multi_select.map((s) => s.name);
    case "number":
      return prop.number ?? 0;
    case "checkbox":
      return prop.checkbox;
    case "url":
      return prop.url ?? "";
    case "email":
      return prop.email ?? "";
    case "phone_number":
      return prop.phone_number ?? "";
    case "date":
      return prop.date?.start ?? "";
    case "files":
      if (prop.files.length === 0) return "";
      const file = prop.files[0];
      if (file.type === "external") return file.external.url;
      if (file.type === "file") return file.file.url;
      return "";
    case "relation":
      return prop.relation.map((r) => r.id);
    default:
      return "";
  }
}

/**
 * Notion 페이지의 title 속성을 찾아서 반환한다.
 */
function getTitle(page: PageObjectResponse): string {
  const titleProp = Object.values(page.properties).find(
    (prop) => prop.type === "title",
  );
  if (!titleProp || titleProp.type !== "title") return "";
  return titleProp.title[0]?.plain_text ?? "";
}

/**
 * Notion 페이지의 files 속성에서 모든 파일 URL을 추출한다.
 */
function getFiles(page: PageObjectResponse, key: string): string[] {
  const prop = page.properties[key];
  if (!prop || prop.type !== "files") return [];

  return prop.files.map((file) => {
    if (file.type === "external") return file.external.url;
    if (file.type === "file") return file.file.url;
    return "";
  });
}

/**
 * Notion 페이지의 블록을 마크다운으로 변환한다.
 */
async function getPageContent(pageId: string): Promise<string> {
  const n2mClient = getN2M();
  if (!n2mClient) return "";

  try {
    const mdBlocks = await n2mClient.pageToMarkdown(pageId);
    const mdString = n2mClient.toMarkdownString(mdBlocks);
    return mdString.parent ?? "";
  } catch (error) {
    console.error(`[Notion] 페이지 콘텐츠 조회 실패 (${pageId}):`, error);
    return "";
  }
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
    const databaseId = process.env.NOTION_DB_TUTORIALS;
    if (!databaseId) {
      console.warn("[Notion] NOTION_DB_TUTORIALS 환경 변수가 없습니다.");
      return [];
    }

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => ({
          id: page.id,
          title: getTitle(page),
          slug: getProp(page, "slug") as string,
          category: getProp(page, "category") as string,
          difficulty: (getProp(page, "difficulty") as string || "beginner") as Tutorial["difficulty"],
          duration: getProp(page, "duration") as string,
          youtubeUrl: getProp(page, "youtubeUrl") as string,
          coverImage: getFiles(page, "coverImage")[0] ?? "",
          excerpt: getProp(page, "excerpt") as string,
          published: getProp(page, "published") as boolean,
          materials: [], // relation 데이터는 추후 구현
          createdAt: page.created_time,
        }));
    } catch (error) {
      console.error("[Notion] 튜토리얼 목록 조회 실패:", error);
      return [];
    }
  },
  ["tutorials-list"],
  { revalidate: 3600 },
);

/**
 * 슬러그로 튜토리얼 상세를 조회한다.
 * ISR: 10분(600초) 캐싱
 */
export const getTutorialBySlug = unstable_cache(
  async (slug: string): Promise<(Tutorial & { content: string }) | null> => {
    const databaseId = process.env.NOTION_DB_TUTORIALS;
    if (!databaseId) return null;

    try {
      const client = getNotionClient();
      // 슬러그로 필터링
      const response = await client.databases.query({
        database_id: databaseId,
        filter: {
          property: "slug",
          rich_text: {
            equals: slug,
          },
        },
      });

      const page = response.results[0];
      if (!page || !("properties" in page)) return null;

      // 페이지 콘텐츠 조회
      const content = await getPageContent(page.id);

      return {
        id: page.id,
        title: getTitle(page),
        slug: getProp(page, "slug") as string,
        category: getProp(page, "category") as string,
        difficulty: (getProp(page, "difficulty") as string || "beginner") as Tutorial["difficulty"],
        duration: getProp(page, "duration") as string,
        youtubeUrl: getProp(page, "youtubeUrl") as string,
        coverImage: getFiles(page, "coverImage")[0] ?? "",
        excerpt: getProp(page, "excerpt") as string,
        published: getProp(page, "published") as boolean,
        materials: [],
        createdAt: page.created_time,
        content,
      };
    } catch (error) {
      console.error(`[Notion] 튜토리얼 상세 조회 실패 (${slug}):`, error);
      return null;
    }
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
    const databaseId = process.env.NOTION_DB_COMBOS;
    if (!databaseId) return [];

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => ({
          id: page.id,
          title: getTitle(page),
          difficulty: (getProp(page, "difficulty") as string || "beginner") as Combo["difficulty"],
          thumbnails: getFiles(page, "thumbnails"),
          excerpt: getProp(page, "excerpt") as string,
          published: getProp(page, "published") as boolean,
          materials: [],
          tutorials: [],
          createdAt: page.created_time,
        }));
    } catch (error) {
      console.error("[Notion] 재료 조합 목록 조회 실패:", error);
      return [];
    }
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
    try {
      const client = getNotionClient();
      const page = await client.pages.retrieve({ page_id: id });
      if (!("properties" in page)) return null;

      const content = await getPageContent(page.id);

      return {
        id: page.id,
        title: getTitle(page),
        difficulty: (getProp(page, "difficulty") as string || "beginner") as Combo["difficulty"],
        thumbnails: getFiles(page, "thumbnails"),
        excerpt: getProp(page, "excerpt") as string,
        published: getProp(page, "published") as boolean,
        materials: [],
        tutorials: [],
        createdAt: page.created_time,
        content,
      };
    } catch (error) {
      console.error(`[Notion] 재료 조합 상세 조회 실패 (${id}):`, error);
      return null;
    }
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
    const databaseId = process.env.NOTION_DB_SEASONS;
    if (!databaseId) return [];

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => ({
          id: page.id,
          title: getTitle(page),
          slug: getProp(page, "slug") as string,
          period: getProp(page, "period") as string,
          heroImage: getFiles(page, "heroImage")[0] ?? "",
          excerpt: getProp(page, "excerpt") as string,
          published: getProp(page, "published") as boolean,
          tutorials: [],
          createdAt: page.created_time,
        }));
    } catch (error) {
      console.error("[Notion] 시즌 캠페인 목록 조회 실패:", error);
      return [];
    }
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
    const databaseId = process.env.NOTION_DB_SEASONS;
    if (!databaseId) return null;

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
        filter: {
          property: "slug",
          rich_text: {
            equals: slug,
          },
        },
      });

      const page = response.results[0];
      if (!page || !("properties" in page)) return null;

      const content = await getPageContent(page.id);

      return {
        id: page.id,
        title: getTitle(page),
        slug: getProp(page, "slug") as string,
        period: getProp(page, "period") as string,
        heroImage: getFiles(page, "heroImage")[0] ?? "",
        excerpt: getProp(page, "excerpt") as string,
        published: getProp(page, "published") as boolean,
        tutorials: [],
        createdAt: page.created_time,
        content,
      };
    } catch (error) {
      console.error(`[Notion] 시즌 캠페인 상세 조회 실패 (${slug}):`, error);
      return null;
    }
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
    const databaseId = process.env.NOTION_DB_CATEGORIES;
    if (!databaseId) return [];

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "order",
            direction: "ascending",
          },
        ],
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => ({
          id: page.id,
          title: getTitle(page),
          slug: getProp(page, "slug") as string,
          icon: getProp(page, "icon") as string,
          order: getProp(page, "order") as number,
        }));
    } catch (error) {
      console.error("[Notion] 카테고리 목록 조회 실패:", error);
      return [];
    }
  },
  ["categories-list"],
  { revalidate: 3600 },
);
