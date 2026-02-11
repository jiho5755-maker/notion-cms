// ============================================================
// PRESSCO 21 — 이메일 발송 함수
// Resend API를 사용하여 견적서 PDF를 이메일로 발송한다.
// ============================================================

import { Resend } from "resend";
import type { CustomerInfo } from "@/types/quotation";

// ------------------------------------------------------------
// Resend 클라이언트 초기화
// ------------------------------------------------------------

function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("[Email] RESEND_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  return new Resend(process.env.RESEND_API_KEY);
}

// ------------------------------------------------------------
// 공개 API: 견적서 이메일 발송
// ------------------------------------------------------------

/**
 * 고객에게 견적서 PDF를 이메일로 발송한다.
 * - 에러 발생 시 예외를 throw (호출하는 쪽에서 처리)
 */
export async function sendQuotationEmail(
  customer: CustomerInfo,
  pdfBlob: Blob,
  quotationNumber: string,
): Promise<void> {
  const resend = getResendClient();

  try {
    // Blob을 Buffer로 변환
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // 이메일 발송
    await resend.emails.send({
      from: "PRESSCO 21 <onboarding@resend.dev>", // TODO: 실제 도메인으로 변경 필요
      to: customer.email,
      subject: `[PRESSCO 21] 견적서 발송 (${quotationNumber})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">견적서 발송</h1>
          <p>안녕하세요, <strong>${customer.name}</strong>님.</p>
          <p>요청하신 견적서를 첨부 파일로 보내드립니다.</p>

          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>견적 번호:</strong> ${quotationNumber}</p>
            <p style="margin: 0;"><strong>발송 일시:</strong> ${new Date().toLocaleString("ko-KR")}</p>
          </div>

          <p>견적서 내용을 확인하시고 문의사항이 있으시면 언제든지 연락 주시기 바랍니다.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

          <p style="font-size: 12px; color: #6b7280;">
            <strong>PRESSCO 21 (프레스코21)</strong><br>
            이메일: ${process.env.COMPANY_EMAIL || "contact@foreverlove.co.kr"}<br>
            전화: ${process.env.COMPANY_PHONE || "1234-5678"}<br>
            웹사이트: <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://hub.foreverlove.co.kr"}">${process.env.NEXT_PUBLIC_SITE_URL || "https://hub.foreverlove.co.kr"}</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `견적서_${customer.name}_${quotationNumber}.pdf`,
          content: buffer,
        },
      ],
    });

    console.log(
      `[Email] 견적서 이메일 발송 성공: ${customer.email} (${quotationNumber})`,
    );
  } catch (error) {
    console.error("[Email] sendQuotationEmail 에러:", error);
    throw new Error("이메일 발송에 실패했습니다.");
  }
}
