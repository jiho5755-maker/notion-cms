import type { QuotationItem, CustomerInfo } from "@/types/quotation";
import { calculateSupplyPrice } from "./price";
import { Client } from "@notionhq/client";

/**
 * 견적서 합계 계산 (역산 방식)
 *
 * 입력 price는 부가세 포함가이므로 역산하여 공급가액과 부가세를 계산
 *
 * @example
 * // 입력: [11000원 × 2개, 5500원 × 1개]
 * // → 공급가: 20000 + 5000 = 25000원
 * // → 부가세: 2000 + 500 = 2500원
 * // → 최종: 27500원 (= 22000 + 5500)
 */
export function calculateQuotationTotal(items: QuotationItem[]) {
  let totalSupplyPrice = 0; // 공급가액 합
  let totalVat = 0; // 부가세 합

  items.forEach((item) => {
    // 1. 단가를 공급가로 역산
    const supplyPrice = calculateSupplyPrice(item.price);

    // 2. 소계 공급가 = 공급가 × 수량
    const subtotalSupplyPrice = supplyPrice * item.quantity;

    // 3. 소계 부가세 = (입력 단가 × 수량) - 소계 공급가
    const subtotalVat = item.subtotal - subtotalSupplyPrice;

    totalSupplyPrice += subtotalSupplyPrice;
    totalVat += subtotalVat;
  });

  return {
    totalAmount: totalSupplyPrice, // 공급가액 합
    vatAmount: totalVat, // 부가세 합
    grandTotal: totalSupplyPrice + totalVat, // 최종 합계 (= 입력 가격 합)
  };
}

/** 견적서 ID 생성 (타임스탬프 기반) */
export function generateQuotationId(): string {
  return `Q${Date.now()}`;
}

/**
 * 견적서 번호 생성 (Q20260211-001 형식)
 * - Q + 날짜(YYYYMMDD) + 순번(3자리)
 */
export function generateQuotationNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, "0");

  return `Q${year}${month}${day}-${sequence}`;
}

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
// 공개 API: 견적서 히스토리 저장
// ------------------------------------------------------------

/**
 * 견적서 생성 내역을 Notion Quotations DB에 저장한다.
 * - 에러 발생 시 콘솔 에러만 출력하고 예외를 throw하지 않음 (저장 실패가 치명적이지 않음)
 */
export async function saveQuotationHistory(
  customer: CustomerInfo,
  items: QuotationItem[],
  notes?: string,
): Promise<void> {
  const client = getNotionClient();
  const dbId = process.env.NOTION_DB_QUOTATIONS;

  if (!dbId) {
    console.warn(
      "[Quotation] NOTION_DB_QUOTATIONS 환경 변수가 설정되지 않았습니다.",
    );
    return;
  }

  try {
    const quotationNumber = generateQuotationNumber();
    const { totalAmount, vatAmount, grandTotal } =
      calculateQuotationTotal(items);

    await client.pages.create({
      parent: { database_id: dbId },
      properties: {
        견적번호: {
          title: [{ text: { content: quotationNumber } }],
        },
        고객명: {
          rich_text: [{ text: { content: customer.name } }],
        },
        이메일: {
          email: customer.email,
        },
        전화번호: {
          phone_number: customer.phone,
        },
        공급가액: {
          number: totalAmount,
        },
        부가세: {
          number: vatAmount,
        },
        총액: {
          number: grandTotal,
        },
        상품목록: {
          rich_text: [{ text: { content: JSON.stringify(items, null, 2) } }],
        },
        문의사항: {
          rich_text: notes
            ? [{ text: { content: notes } }]
            : [{ text: { content: "" } }],
        },
      },
    });

    console.log(
      `[Quotation] 히스토리 저장 성공: ${quotationNumber} (${customer.name})`,
    );
  } catch (error) {
    console.error("[Quotation] saveQuotationHistory 에러:", error);
    // 에러 무시 (히스토리 저장 실패는 치명적이지 않음)
  }
}
