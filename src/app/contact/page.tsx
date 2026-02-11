import type { Metadata } from "next";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "문의하기 | PRESSCO 21",
  description:
    "궁금한 사항이나 도움이 필요하신가요? 문의사항을 남겨주시면 빠르게 답변 드리겠습니다.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">문의하기</h1>
          <p className="text-lg text-muted-foreground">
            궁금한 사항을 남겨주세요. 빠르게 답변 드리겠습니다.
          </p>
        </div>

        {/* 안내 사항 */}
        <div className="mb-8 rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
          <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
            문의 전 확인해주세요
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>
              • 자주 묻는 질문에서 답변을 먼저 확인하시면 더 빠르게 해결하실 수
              있습니다.
            </li>
            <li>• 평일 09:00-18:00 기준 24시간 내 답변 드립니다.</li>
            <li>• 주말/공휴일에는 답변이 지연될 수 있습니다.</li>
          </ul>
        </div>

        {/* 문의 폼 */}
        <ContactForm />
      </div>
    </div>
  );
}
