/**
 * FAQ 카드 컴포넌트
 * - FAQ 제목, 카테고리, 조회수 표시
 * - 검색어 하이라이트
 * - 클릭 시 상세 페이지로 이동
 */

import Link from "next/link";
import { Eye } from "lucide-react";
import type { FAQ } from "@/types/faq";
import { FAQ_CATEGORY_COLORS } from "@/types/faq";

interface FAQCardProps {
  faq: FAQ;
  searchQuery?: string;
}

/**
 * 텍스트에서 검색어를 하이라이트 처리한다.
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={index}
        className="bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function FAQCard({ faq, searchQuery = "" }: FAQCardProps) {
  return (
    <Link
      href={`/faq/${faq.id}`}
      className="block rounded-lg border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold">
            {highlightText(faq.title, searchQuery)}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${FAQ_CATEGORY_COLORS[faq.category]}`}
            >
              {faq.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {faq.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
