"use client";

/**
 * FAQ 그리드 컴포넌트
 * - 카테고리 탭 필터
 * - 검색 기능
 * - FAQ 카드 목록
 */

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { FAQ, FAQCategory } from "@/types/faq";
import { FAQCard } from "./faq-card";
import { EmptyState } from "@/components/shared/empty-state";

interface FAQGridProps {
  faqs: FAQ[];
  categories: FAQCategory[];
}

export function FAQGrid({ faqs, categories }: FAQGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    FAQCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 필터링된 FAQ 목록
  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;

      const matchesSearch =
        searchQuery === "" ||
        faq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.content.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div>
      {/* 카테고리 탭 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="FAQ 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* FAQ 목록 */}
      {filteredFAQs.length > 0 ? (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <FAQCard key={faq.id} faq={faq} />
          ))}
        </div>
      ) : (
        <EmptyState
          type="search"
          message="검색 결과가 없습니다"
          description="다른 키워드로 검색해보세요"
        />
      )}
    </div>
  );
}
