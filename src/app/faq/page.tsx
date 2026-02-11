import type { Metadata } from "next";
import { getFAQs, getFAQCategories } from "@/lib/faq";
import { FAQGrid } from "./_components/faq-grid";

export const metadata: Metadata = {
  title: "자주 묻는 질문 | PRESSCO 21",
  description:
    "배송, 결제, 교환/환불 등 자주 묻는 질문과 답변을 확인하세요. 궁금한 사항을 빠르게 해결할 수 있습니다.",
};

export default async function FAQPage() {
  const [faqs, categories] = await Promise.all([
    getFAQs(),
    getFAQCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">자주 묻는 질문</h1>
          <p className="text-lg text-muted-foreground">
            궁금하신 사항을 빠르게 확인하세요
          </p>
        </div>

        {/* FAQ 그리드 (카테고리 탭 + 검색 포함) */}
        <FAQGrid faqs={faqs} categories={categories} />

        {/* 추가 문의 안내 */}
        <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold">
            찾으시는 답변이 없으신가요?
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            문의하기를 통해 직접 질문해주세요. 빠르게 답변 드리겠습니다.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
