// ============================================================
// PRESSCO 21 — 문의 데이터 페칭 함수
// Notion Official SDK로 Inquiries DB를 조회한다.
// ============================================================

import { unstable_cache } from "next/cache";
import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type {
  Inquiry,
  InquiryCategory,
  InquiryStatus,
  InquiryPriority,
} from "@/types/inquiry";

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
): string | number | boolean | null {
  const prop = page.properties[key];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return prop.title[0]?.plain_text ?? "";
    case "rich_text":
      return prop.rich_text[0]?.plain_text ?? "";
    case "email":
      return prop.email ?? "";
    case "phone_number":
      return prop.phone_number ?? "";
    case "select":
      return prop.select?.name ?? "";
    case "date":
      return prop.date?.start ?? null;
    case "created_time":
      return prop.created_time ?? "";
    case "url":
      return prop.url ?? null;
    case "number":
      return prop.number ?? null;
    default:
      return "";
  }
}

// ------------------------------------------------------------
// 공개 API: 문의 목록 조회
// ------------------------------------------------------------

/**
 * 노션 Inquiries DB에서 문의 목록을 가져온다.
 * - createdTime 내림차순 정렬 (최신순)
 * - ISR 캐싱: 600초 (10분)
 */
export async function getInquiries(): Promise<Inquiry[]> {
  const client = getNotionClient();
  const dbId = process.env.NOTION_DB_INQUIRIES;

  if (!dbId) {
    console.warn("[Inquiry] NOTION_DB_INQUIRIES 환경 변수가 설정되지 않았습니다.");
    return [];
  }

  return unstable_cache(
    async () => {
      try {
        const response = await client.databases.query({
          database_id: dbId,
          sorts: [{ timestamp: "created_time", direction: "descending" }],
        });

        const inquiries: Inquiry[] = response.results
          .filter((result): result is PageObjectResponse => "properties" in result)
          .map((page) => ({
            id: page.id,
            title: getProp(page, "title") as string,
            name: getProp(page, "name") as string,
            email: getProp(page, "email") as string,
            phone: getProp(page, "phone") as string,
            category: getProp(page, "category") as InquiryCategory,
            message: getProp(page, "message") as string,
            status: getProp(page, "status") as InquiryStatus,
            priority: getProp(page, "priority") as InquiryPriority,
            reply: (getProp(page, "reply") as string) || null,
            replyDate: getProp(page, "replyDate") as string | null,
            createdTime: getProp(page, "createdTime") as string,

            // 첨부파일 (선택 사항)
            attachmentUrl: (getProp(page, "attachmentUrl") as string) || null,
            attachmentName: (getProp(page, "attachmentName") as string) || null,
            attachmentSize: (getProp(page, "attachmentSize") as number) || null,
          }));

        return inquiries;
      } catch (error) {
        console.error("[Inquiry] getInquiries 에러:", error);
        return [];
      }
    },
    ["inquiries"],
    { revalidate: 600, tags: ["inquiries"] },
  )();
}

// ------------------------------------------------------------
// 공개 API: 문의 상세 조회
// ------------------------------------------------------------

/**
 * 노션 Inquiries DB에서 특정 문의를 ID로 조회한다.
 * - ISR 캐싱: 600초 (10분)
 */
export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const client = getNotionClient();

  return unstable_cache(
    async () => {
      try {
        const response = await client.pages.retrieve({ page_id: id });

        if (!("properties" in response)) return null;

        const page = response as PageObjectResponse;

        return {
          id: page.id,
          title: getProp(page, "title") as string,
          name: getProp(page, "name") as string,
          email: getProp(page, "email") as string,
          phone: getProp(page, "phone") as string,
          category: getProp(page, "category") as InquiryCategory,
          message: getProp(page, "message") as string,
          status: getProp(page, "status") as InquiryStatus,
          priority: getProp(page, "priority") as InquiryPriority,
          reply: (getProp(page, "reply") as string) || null,
          replyDate: getProp(page, "replyDate") as string | null,
          createdTime: getProp(page, "createdTime") as string,

          // 첨부파일 (선택 사항)
          attachmentUrl: (getProp(page, "attachmentUrl") as string) || null,
          attachmentName: (getProp(page, "attachmentName") as string) || null,
          attachmentSize: (getProp(page, "attachmentSize") as number) || null,
        } satisfies Inquiry;
      } catch (error) {
        console.error(`[Inquiry] getInquiryById(${id}) 에러:`, error);
        return null;
      }
    },
    [`inquiry-${id}`],
    { revalidate: 600, tags: [`inquiry-${id}`, "inquiries"] },
  )();
}

