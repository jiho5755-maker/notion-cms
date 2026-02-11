// ============================================================
// PRESSCO 21 — 문의 Server Actions
// revalidatePath가 포함된 액션을 분리
// ============================================================

"use server";

import { revalidatePath } from "next/cache";
import { Client } from "@notionhq/client";

/**
 * Notion 클라이언트 초기화
 */
function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[Notion] NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }

  return new Client({ auth: process.env.NOTION_TOKEN });
}

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
  category: string;
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
