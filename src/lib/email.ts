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
 * 사업자 정보 가져오기
 */
function getCompanyInfo() {
  return {
    name: process.env.COMPANY_NAME || "프레스코21",
    registrationId: process.env.COMPANY_REGISTRATION_ID || "215-05-52221",
    type: process.env.COMPANY_TYPE || "개인사업자",
    address: process.env.COMPANY_ADDRESS || "",
    phone: process.env.COMPANY_PHONE || "",
    email: process.env.COMPANY_EMAIL || "",
  };
}

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
  const company = getCompanyInfo();

  try {
    // Blob을 Buffer로 변환
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // 발신자 이메일 설정 (도메인 인증된 이메일이 없으면 Resend 기본 발신자 사용)
    const fromEmail = company.email
      ? `${company.name} <${company.email}>`
      : "PRESSCO 21 <onboarding@resend.dev>";

    // 이메일 발송
    await resend.emails.send({
      from: fromEmail,
      to: customer.email,
      subject: `[PRESSCO 21] 견적서 발급 완료 - ${customer.name}님`,
      html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 24px;
      line-height: 1.8;
    }
    .info-box {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      margin: 24px 0;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-weight: 600;
      color: #4b5563;
      width: 100px;
      flex-shrink: 0;
    }
    .info-value {
      color: #1f2937;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 16px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
    .footer-title {
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .footer p {
      margin: 4px 0;
    }
    .tagline {
      text-align: center;
      margin-top: 16px;
      font-style: italic;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 헤더 -->
    <div class="header">
      <h1>견적서 발급 완료</h1>
      <p>견적 번호: ${quotationNumber}</p>
    </div>

    <!-- 본문 -->
    <div class="content">
      <!-- 인사말 -->
      <div class="greeting">
        <strong>${customer.name}</strong>님께<br>
        안녕하세요. <strong>${company.name}</strong>입니다.<br>
        요청하신 견적서를 첨부 파일로 발송드립니다.
      </div>

      <!-- 견적 정보 -->
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">견적 번호</span>
          <span class="info-value">${quotationNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">발송 일시</span>
          <span class="info-value">${new Date().toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">첨부 파일</span>
          <span class="info-value">견적서_${customer.name}_${quotationNumber}.pdf</span>
        </div>
      </div>

      <!-- 안내 메시지 -->
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        첨부된 PDF 파일을 확인해주세요.<br>
        견적서 관련 문의사항이 있으시면 아래 연락처로 언제든지 문의 부탁드립니다.<br>
        감사합니다.
      </p>

      ${process.env.NEXT_PUBLIC_SITE_URL ? `
      <!-- 웹사이트 링크 -->
      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}" class="button">웹사이트 방문하기</a>
      </div>
      ` : ""}
    </div>

    <!-- 푸터 - 사업자 정보 -->
    <div class="footer">
      <div class="footer-title">사업자 정보</div>
      <p><strong>상호명:</strong> ${company.name} | <strong>사업자번호:</strong> ${company.registrationId} (${company.type})</p>
      ${company.address ? `<p><strong>주소:</strong> ${company.address}</p>` : ""}
      ${company.phone ? `<p><strong>전화:</strong> ${company.phone}</p>` : ""}
      ${company.email ? `<p><strong>이메일:</strong> ${company.email}</p>` : ""}
      <p class="tagline">PRESSCO 21 - 꽃으로 노는 모든 방법</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `
견적서 발급 완료

${customer.name}님께
안녕하세요. ${company.name}입니다.

요청하신 견적서를 첨부 파일로 발송드립니다.

------------------------------------------
견적 정보
------------------------------------------
견적 번호: ${quotationNumber}
발송 일시: ${new Date().toLocaleString("ko-KR")}
첨부 파일: 견적서_${customer.name}_${quotationNumber}.pdf

첨부된 PDF 파일을 확인해주세요.
견적서 관련 문의사항이 있으시면 아래 연락처로 언제든지 문의 부탁드립니다.
감사합니다.

------------------------------------------
사업자 정보
------------------------------------------
상호명: ${company.name}
사업자번호: ${company.registrationId} (${company.type})
${company.address ? `주소: ${company.address}\n` : ""}${company.phone ? `전화: ${company.phone}\n` : ""}${company.email ? `이메일: ${company.email}\n` : ""}${process.env.NEXT_PUBLIC_SITE_URL ? `웹사이트: ${process.env.NEXT_PUBLIC_SITE_URL}\n` : ""}
PRESSCO 21 - 꽃으로 노는 모든 방법
      `.trim(),
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
