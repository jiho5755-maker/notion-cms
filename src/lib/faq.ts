// ============================================================
// PRESSCO 21 — FAQ 데이터 페칭 함수
// Notion Official SDK로 FAQs DB를 조회한다.
// ============================================================

import { unstable_cache } from "next/cache";
import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FAQ, FAQCategory } from "@/types/faq";
import { NotionToMarkdown } from "notion-to-md";

// ------------------------------------------------------------
// Notion 클라이언트 초기화
// ------------------------------------------------------------

function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[Notion] NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }

  return new Client({ auth: process.env.NOTION_TOKEN });
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
): string | number | boolean {
  const prop = page.properties[key];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return prop.title[0]?.plain_text ?? "";
    case "rich_text":
      return prop.rich_text[0]?.plain_text ?? "";
    case "number":
      return prop.number ?? 0;
    case "select":
      return prop.select?.name ?? "";
    case "checkbox":
      return prop.checkbox ?? false;
    case "created_time":
      return prop.created_time ?? "";
    default:
      return "";
  }
}

// ------------------------------------------------------------
// 공개 API: FAQ 목록 조회
// ------------------------------------------------------------

/**
 * 노션 FAQs DB에서 발행된 FAQ 목록을 가져온다.
 * - published 필터는 체크박스 타입 불일치로 제거, 조회 후 필터링
 * - category → order 정렬
 * - ISR 캐싱: 3600초 (1시간)
 */
export async function getFAQs(): Promise<FAQ[]> {
  const client = getNotionClient();
  const dbId = process.env.NOTION_DB_FAQS;

  if (!dbId) {
    console.warn("[FAQ] NOTION_DB_FAQS 환경 변수가 설정되지 않았습니다.");
    return [];
  }

  return unstable_cache(
    async () => {
      try {
        const response = await client.databases.query({
          database_id: dbId,
          sorts: [
            { property: "category", direction: "ascending" },
            { property: "order", direction: "ascending" },
          ],
        });

        const n2m = new NotionToMarkdown({ notionClient: client });

        const faqs = await Promise.all(
          response.results.map(async (result) => {
            if (!("properties" in result)) return null;

            const page = result as PageObjectResponse;

            const mdBlocks = await n2m.pageToMarkdown(page.id);
            const content = n2m.toMarkdownString(mdBlocks).parent;

            return {
              id: page.id,
              title: getProp(page, "title") as string,
              category: getProp(page, "category") as FAQCategory,
              order: getProp(page, "order") as number,
              published: getProp(page, "published") as boolean,
              views: getProp(page, "views") as number,
              content,
              createdTime: getProp(page, "createdTime") as string,
            } satisfies FAQ;
          }),
        );

        // published = true인 FAQ만 반환
        return faqs.filter(
          (faq): faq is FAQ => faq !== null && faq.published,
        );
      } catch (error) {
        console.error("[FAQ] getFAQs 에러:", error);
        return [];
      }
    },
    ["faqs"],
    { revalidate: 3600, tags: ["faqs"] },
  )();
}

// ------------------------------------------------------------
// 공개 API: FAQ 상세 조회
// ------------------------------------------------------------

/**
 * 노션 FAQs DB에서 특정 FAQ를 ID로 조회한다.
 * - ISR 캐싱: 600초 (10분)
 */
export async function getFAQById(id: string): Promise<FAQ | null> {
  const client = getNotionClient();

  return unstable_cache(
    async () => {
      try {
        const response = await client.pages.retrieve({ page_id: id });

        if (!("properties" in response)) return null;

        const page = response as PageObjectResponse;

        const n2m = new NotionToMarkdown({ notionClient: client });
        const mdBlocks = await n2m.pageToMarkdown(page.id);
        const content = n2m.toMarkdownString(mdBlocks).parent;

        return {
          id: page.id,
          title: getProp(page, "title") as string,
          category: getProp(page, "category") as FAQCategory,
          order: getProp(page, "order") as number,
          published: getProp(page, "published") as boolean,
          views: getProp(page, "views") as number,
          content,
          createdTime: getProp(page, "createdTime") as string,
        } satisfies FAQ;
      } catch (error) {
        console.error(`[FAQ] getFAQById(${id}) 에러:`, error);
        return null;
      }
    },
    [`faq-${id}`],
    { revalidate: 600, tags: [`faq-${id}`, "faqs"] },
  )();
}

// ------------------------------------------------------------
// 공개 API: FAQ 카테고리 목록 조회
// ------------------------------------------------------------

/**
 * 발행된 FAQ에서 사용 중인 카테고리 목록을 반환한다.
 */
export async function getFAQCategories(): Promise<FAQCategory[]> {
  const faqs = await getFAQs();
  const categories = new Set<FAQCategory>();

  faqs.forEach((faq) => categories.add(faq.category));

  return Array.from(categories).sort();
}

// ------------------------------------------------------------
// 공개 API: FAQ 조회수 증가
// ------------------------------------------------------------

/**
 * FAQ 조회수를 1 증가시킨다.
 * - 에러 발생 시 무시 (조회수는 중요하지 않음)
 * - 캐시는 자연스럽게 revalidate 시간 후 갱신됨
 */
export async function incrementFAQViews(id: string): Promise<void> {
  const client = getNotionClient();

  try {
    const response = await client.pages.retrieve({ page_id: id });

    if (!("properties" in response)) return;

    const page = response as PageObjectResponse;
    const currentViews = (getProp(page, "views") as number) || 0;

    await client.pages.update({
      page_id: id,
      properties: {
        views: { number: currentViews + 1 },
      },
    });
  } catch (error) {
    console.error(`[FAQ] incrementFAQViews(${id}) 에러:`, error);
    // 에러 무시 (조회수 증가 실패는 치명적이지 않음)
  }
}
