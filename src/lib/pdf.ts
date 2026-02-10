import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quotation } from "@/types/quotation";
import { formatPrice } from "./price";

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
  pdf.text(`총액: ${formatPrice(quotation.totalAmount)}`, 140, finalY + 10);
  pdf.text(`VAT (10%): ${formatPrice(quotation.vatAmount)}`, 140, finalY + 17);

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `최종 합계: ${formatPrice(quotation.grandTotal)}`,
    140,
    finalY + 27
  );

  // 문의사항 (있는 경우)
  if (quotation.customer.message) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("문의사항", 20, finalY + 40);
    pdf.setFontSize(10);

    // 문의사항 텍스트를 줄바꿈 처리
    const lines = pdf.splitTextToSize(quotation.customer.message, 170);
    pdf.text(lines, 20, finalY + 48);
  }

  // 푸터
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text("PRESSCO 21 — 꽃으로 노는 모든 방법", 105, 280, {
    align: "center",
  });
  pdf.text("www.foreverlove.co.kr", 105, 285, { align: "center" });

  return pdf.output("blob");
}
