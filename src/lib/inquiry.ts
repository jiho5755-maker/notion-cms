// ============================================================
// PRESSCO 21 — 문의 데이터 페칭 함수
// Notion Official SDK로 Inquiries DB를 조회한다.
// ============================================================

import { unstable_cache, revalidatePath } from "next/cache";
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

        const inquiries = response.results.map((result) => {
          if (!("properties" in result)) return null;

          const page = result as PageObjectResponse;

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
          } satisfies Inquiry;
        });

        return inquiries.filter((inquiry): inquiry is Inquiry => inquiry !== null);
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

// ------------------------------------------------------------
// 공개 API: 문의 생성
// ------------------------------------------------------------

/**
 * 새로운 문의를 노션 DB에 생성한다.
 * - 상태: "접수", 우선순위: "보통"으로 초기화
 * - 생성 후 ISR 캐시 재검증
 */
export async function createInquiry(data: {
  title: string;
  name: string;
  email: string;
  phone: string;
  category: InquiryCategory;
  message: string;
}): Promise<string | null> {
  const client = getNotionClient();
  const dbId = process.env.NOTION_DB_INQUIRIES;

  if (!dbId) {
    console.error("[Inquiry] NOTION_DB_INQUIRIES 환경 변수가 설정되지 않았습니다.");
    return null;
  }

  try {
    const response = await client.pages.create({
      parent: { database_id: dbId },
      properties: {
        title: { title: [{ text: { content: data.title } }] },
        name: { rich_text: [{ text: { content: data.name } }] },
        email: { email: data.email },
        phone: { phone_number: data.phone },
        category: { select: { name: data.category } },
        message: { rich_text: [{ text: { content: data.message } }] },
        status: { select: { name: "접수" } },
        priority: { select: { name: "보통" } },
      },
    });

    // ISR 캐시 재검증 (관리자 페이지)
    revalidatePath("/admin/inquiries");

    return response.id;
  } catch (error) {
    console.error("[Inquiry] createInquiry 에러:", error);
    return null;
  }
}

// ------------------------------------------------------------
// 공개 API: 문의 답변 업데이트
// ------------------------------------------------------------

/**
 * 문의에 대한 답변을 업데이트한다.
 * - status를 "완료"로 변경
 * - replyDate를 현재 날짜로 설정
 * - ISR 캐시 재검증
 */
export async function updateInquiryReply(
  id: string,
  reply: string,
): Promise<boolean> {
  const client = getNotionClient();

  try {
    const today = new Date().toISOString().split("T")[0];

    await client.pages.update({
      page_id: id,
      properties: {
        reply: { rich_text: [{ text: { content: reply } }] },
        status: { select: { name: "완료" } },
        replyDate: { date: { start: today } },
      },
    });

    // ISR 캐시 재검증
    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${id}`);

    return true;
  } catch (error) {
    console.error(`[Inquiry] updateInquiryReply(${id}) 에러:`, error);
    return false;
  }
}
