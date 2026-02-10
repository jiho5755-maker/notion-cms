"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TutorialCard } from "@/components/shared/tutorial-card";
import type { Tutorial, Category } from "@/types";

interface TutorialGridProps {
  tutorials: Tutorial[];
  categories: Category[];
}

/**
 * 카테고리 필터 탭 + 튜토리얼 카드 그리드.
 * 클라이언트 컴포넌트로 분리하여 필터 인터랙션을 처리한다.
 */
export function TutorialGrid({ tutorials, categories }: TutorialGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  // 현재 선택된 카테고리에 맞게 필터링
  const filteredTutorials =
    activeCategory === "all"
      ? tutorials
      : tutorials.filter((t) => t.category === activeCategory);

  return (
    <Tabs
      defaultValue="all"
      onValueChange={setActiveCategory}
      className="w-full"
    >
      {/* 카테고리 필터 탭 */}
      <TabsList className="mb-8 flex-wrap">
        <TabsTrigger value="all">전체</TabsTrigger>
        {categories.map((cat) => (
          <TabsTrigger key={cat.id} value={cat.title}>
            {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
            {cat.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* 카드 그리드 — 모든 탭에서 공유 */}
      <TabsContent value={activeCategory} forceMount>
        {filteredTutorials.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <p className="text-muted-foreground text-sm">
              이 카테고리에 등록된 튜토리얼이 없습니다.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
