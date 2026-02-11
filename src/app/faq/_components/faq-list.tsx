"use client";

/**
 * FAQ 목록 컴포넌트
 * - 필터링된 FAQ 목록 표시
 * - 검색어 하이라이트
 * - 빈 상태 UI
 */

import { useMemo } from "react";
import type { FAQ } from "@/types/faq";
import { FAQCard } from "./faq-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface FAQListProps {
  faqs: FAQ[];
  searchQuery: string;
}

export function FAQList({ faqs, searchQuery }: FAQListProps) {
  // 검색어로 필터링
  const filteredFAQs = useMemo(() => {
    if (!searchQuery) return faqs;

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.title.toLowerCase().includes(query) ||
        faq.content.toLowerCase().includes(query),
    );
  }, [faqs, searchQuery]);

  // 검색 결과 개수
  const resultCount = filteredFAQs.length;

  return (
    <div>
      {/* 검색 결과 개수 표시 */}
      {searchQuery && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">검색 결과</span>
          <Badge variant="secondary">{resultCount}개</Badge>
        </div>
      )}

      {/* FAQ 목록 */}
      {resultCount > 0 ? (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <FAQCard key={faq.id} faq={faq} searchQuery={searchQuery} />
          ))}
        </div>
      ) : (
        <EmptyState
          type="search"
          message={
            searchQuery
              ? `"${searchQuery}"에 대한 검색 결과가 없습니다`
              : "FAQ가 없습니다"
          }
          description={
            searchQuery
              ? "다른 키워드로 검색해보세요"
              : "FAQ가 등록되면 이곳에 표시됩니다"
          }
        />
      )}
    </div>
  );
}
