import type { Metadata } from "next";
import { getTutorials, getCategories } from "@/lib/notion";
import { TutorialGrid } from "./_components/tutorial-grid";

// ------------------------------------------------------------
// 메타데이터
// ------------------------------------------------------------

export const metadata: Metadata = {
  title: "튜토리얼",
  description:
    "압화 만들기 튜토리얼을 단계별로 따라해 보세요. 초급부터 고급까지, 다양한 카테고리의 가이드를 제공합니다.",
};

// ------------------------------------------------------------
// 튜토리얼 목록 페이지 (Server Component)
// ------------------------------------------------------------

export default async function TutorialsPage() {
  const [tutorials, categories] = await Promise.all([
    getTutorials(),
    getCategories(),
  ]);

  return (
    <section className="container mx-auto px-4 py-12">
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">튜토리얼</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          압화 만들기를 단계별로 따라해 보세요. 영상과 재료 목록을 함께
          제공합니다.
        </p>
      </div>

      {/* 튜토리얼이 없는 경우 */}
      {tutorials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24">
          <p className="text-muted-foreground">
            아직 등록된 튜토리얼이 없습니다.
          </p>
        </div>
      ) : (
        /* 카테고리 필터 + 카드 그리드 (클라이언트 컴포넌트) */
        <TutorialGrid tutorials={tutorials} categories={categories} />
      )}
    </section>
  );
}
