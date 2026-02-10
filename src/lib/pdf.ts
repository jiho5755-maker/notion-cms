import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanyInfo, Quotation } from "@/types/quotation";
import { formatPrice } from "./price";

// 사업자 정보 (환경 변수에서 로드)
const COMPANY_INFO: CompanyInfo = {
  name: process.env.COMPANY_NAME || "프레스코21",
  registrationId: process.env.COMPANY_REGISTRATION_ID || "215-05-52221",
  type: process.env.COMPANY_TYPE || "개인사업자",
  address: process.env.COMPANY_ADDRESS || "",
  phone: process.env.COMPANY_PHONE || "",
  email: process.env.COMPANY_EMAIL || "",
};

/**
 * 견적서 PDF 생성
 *
 * @param quotation - 견적서 데이터
 * @returns PDF Blob
 */
export async function generateQuotationPDF(
  quotation: Quotation
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // 헤더: "견적서" 제목
  pdf.setFontSize(24);
  pdf.text("견적서", 105, 20, { align: "center" });

  // 견적 정보
  pdf.setFontSize(10);
  pdf.text(`견적 번호: ${quotation.id}`, 20, 30);
  pdf.text(
    `작성일: ${new Date(quotation.createdAt).toLocaleDateString("ko-KR")}`,
    20,
    36
  );

  // 고객 정보
  pdf.setFontSize(12);
  pdf.text("고객 정보", 20, 50);
  pdf.setFontSize(10);
  pdf.text(`이름: ${quotation.customer.name}`, 20, 58);
  pdf.text(`이메일: ${quotation.customer.email}`, 20, 64);
  pdf.text(`전화번호: ${quotation.customer.phone}`, 20, 70);

  if (quotation.customer.address) {
    pdf.text(`주소: ${quotation.customer.address}`, 20, 76);
  }

  // 상품 테이블
  const startY = quotation.customer.address ? 85 : 80;

  autoTable(pdf, {
    startY,
    head: [["상품명", "단가", "수량", "소계"]],
    body: quotation.items.map((item) => [
      item.name,
      formatPrice(item.price),
      item.quantity.toString(),
      formatPrice(item.subtotal),
    ]),
    styles: { fontSize: 10, font: "helvetica" },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 40, halign: "right" },
    },
  });

  // 합계 (테이블 하단)
  const finalY = (pdf as any).lastAutoTable.finalY || 100;

  pdf.setFontSize(12);
  pdf.text(
    `공급가액: ${formatPrice(quotation.totalAmount)}`,
    140,
    finalY + 10
  );
  pdf.text(
    `부가세 (10%): ${formatPrice(quotation.vatAmount)}`,
    140,
    finalY + 17
  );

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `최종 합계: ${formatPrice(quotation.grandTotal)}`,
    140,
    finalY + 27
  );

  // 설명 추가 (작은 글씨)
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("* 공급가액은 부가세를 제외한 금액입니다.", 140, finalY + 34);

  // 문의사항 (있는 경우)
  let footerY = finalY + 45;

  if (quotation.customer.message) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("문의사항", 20, footerY);
    pdf.setFontSize(10);

    // 문의사항 텍스트를 줄바꿈 처리
    const messageLines = pdf.splitTextToSize(quotation.customer.message, 170);
    pdf.text(messageLines, 20, footerY + 8);

    // 메시지 줄 수에 따라 푸터 위치 조정
    const messageHeight = messageLines.length * 4;
    footerY = footerY + 8 + messageHeight + 10;
  }

  // 페이지 넘침 방지 (A4는 297mm)
  if (footerY > 240) {
    pdf.addPage();
    footerY = 20;
  }

  // 푸터 - 사업자 정보
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("사업자 정보", 20, footerY);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(64, 64, 64);

  let currentY = footerY + 6;

  pdf.text(`상호명: ${COMPANY_INFO.name}`, 20, currentY);
  currentY += 4;

  pdf.text(
    `사업자번호: ${COMPANY_INFO.registrationId} (${COMPANY_INFO.type})`,
    20,
    currentY
  );
  currentY += 4;

  if (COMPANY_INFO.address) {
    pdf.text(`주소: ${COMPANY_INFO.address}`, 20, currentY);
    currentY += 4;
  }

  if (COMPANY_INFO.phone) {
    pdf.text(`전화: ${COMPANY_INFO.phone}`, 20, currentY);
    currentY += 4;
  }

  if (COMPANY_INFO.email) {
    pdf.text(`이메일: ${COMPANY_INFO.email}`, 20, currentY);
    currentY += 4;
  }

  // 브랜드 태그라인
  pdf.setFontSize(7);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    "꽃으로 노는 모든 방법 — www.foreverlove.co.kr",
    20,
    currentY + 2
  );

  return pdf.output("blob");
}
