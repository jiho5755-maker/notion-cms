import type { Metadata } from "next";
import { QuotationClient } from "./_components/quotation-client";

export const metadata: Metadata = {
  title: "셀프 견적서 — PRESSCO 21",
  description:
    "필요한 재료를 선택하고 견적서를 PDF로 생성하세요. DIY 취미인, 학교/복지관/기업 대량 구매 전 견적서 출력용.",
  openGraph: {
    title: "셀프 견적서 — PRESSCO 21",
    description: "필요한 재료를 선택하고 견적서를 PDF로 생성하세요.",
  },
};

export default function QuotationPage() {
  return (
    <main className="container py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">셀프 견적서</h1>
        <p className="text-muted-foreground mt-2">
          필요한 재료를 검색하고 선택하여 PDF 견적서를 생성하세요.
        </p>
      </div>

      {/* 클라이언트 컴포넌트 */}
      <QuotationClient />
    </main>
  );
}
