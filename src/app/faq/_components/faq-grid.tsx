"use client";

/**
 * FAQ 그리드 컴포넌트
 * - 카테고리 탭 필터 (shadcn/ui Tabs)
 * - 실시간 검색 (debounce 300ms)
 * - 검색어 하이라이트
 * - 검색 결과 개수 표시
 */

import { useState, useMemo, useCallback } from "react";
import type { FAQ, FAQCategory } from "@/types/faq";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAQSearch } from "./faq-search";
import { FAQList } from "./faq-list";

interface FAQGridProps {
  faqs: FAQ[];
  categories: FAQCategory[];
}

export function FAQGrid({ faqs, categories }: FAQGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    FAQCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 검색 콜백 (useCallback으로 메모이제이션)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 카테고리별로 필터링된 FAQ 목록
  const filteredFAQsByCategory = useMemo(() => {
    if (selectedCategory === "all") return faqs;
    return faqs.filter((faq) => faq.category === selectedCategory);
  }, [faqs, selectedCategory]);

  // 카테고리별 FAQ 개수
  const categoryCount = useMemo(() => {
    const count: Partial<Record<FAQCategory | "all", number>> = {
      all: faqs.length,
    };
    categories.forEach((category) => {
      count[category] = faqs.filter((faq) => faq.category === category).length;
    });
    return count;
  }, [faqs, categories]);

  return (
    <div>
      {/* 검색 바 */}
      <div className="mb-6">
        <FAQSearch onSearch={handleSearch} />
      </div>

      {/* 카테고리 탭 */}
      <Tabs
        value={selectedCategory}
        onValueChange={(value) =>
          setSelectedCategory(value as FAQCategory | "all")
        }
        className="w-full"
      >
        <TabsList className="mb-6 h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="all" className="rounded-full">
            전체 ({categoryCount.all})
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="rounded-full"
            >
              {category} ({categoryCount[category]})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 전체 탭 */}
        <TabsContent value="all" className="mt-0">
          <FAQList faqs={faqs} searchQuery={searchQuery} />
        </TabsContent>

        {/* 카테고리별 탭 */}
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <FAQList
              faqs={filteredFAQsByCategory}
              searchQuery={searchQuery}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
