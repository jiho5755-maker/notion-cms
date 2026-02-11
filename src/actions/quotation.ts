"use server";

import type { CustomerInfo, QuotationItem } from "@/types/quotation";
import { generateQuotationNumber } from "@/lib/quotation";
import { saveQuotationHistory } from "@/lib/quotation";
import { sendQuotationEmail } from "@/lib/email";

/**
 * 견적서 생성 Server Action
 *
 * 1. 견적서 번호 생성
 * 2. 노션 DB에 히스토리 저장
 * 3. 이메일 발송
 *
 * @param customer - 고객 정보
 * @param items - 견적서 항목
 * @param pdfBuffer - PDF 파일 Buffer
 * @returns 성공 여부 및 견적서 번호
 */
export async function generateQuotationAction(
  customer: CustomerInfo,
  items: QuotationItem[],
  pdfBuffer: ArrayBuffer
): Promise<{ success: boolean; quotationNumber: string; error?: string }> {
  try {
    // 1. 견적서 번호 생성
    const quotationNumber = generateQuotationNumber();

    // 2. 노션 DB에 히스토리 저장
    try {
      await saveQuotationHistory(customer, items, customer.message);
    } catch (notionError) {
      console.error("[Server Action] 노션 저장 실패:", notionError);
      // 노션 저장 실패해도 이메일은 발송 시도
    }

    // 3. 이메일 발송
    try {
      const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
      await sendQuotationEmail(customer, pdfBlob, quotationNumber);
    } catch (emailError) {
      console.error("[Server Action] 이메일 발송 실패:", emailError);
      // 이메일 발송 실패해도 성공으로 처리 (PDF는 이미 다운로드됨)
      return {
        success: true,
        quotationNumber,
        error: "이메일 발송에 실패했습니다. PDF는 다운로드되었습니다.",
      };
    }

    return { success: true, quotationNumber };
  } catch (error) {
    console.error("[Server Action] 견적서 생성 실패:", error);
    return {
      success: false,
      quotationNumber: "",
      error:
        error instanceof Error ? error.message : "견적서 생성에 실패했습니다.",
    };
  }
}
