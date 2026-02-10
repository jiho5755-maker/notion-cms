import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTutorials, getTutorialBySlug } from "@/lib/notion";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { YoutubeEmbed } from "@/components/shared/youtube-embed";
import { MaterialSidebar } from "@/components/shared/material-sidebar";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { Separator } from "@/components/ui/separator";
import type { PageParams } from "@/types";

// ------------------------------------------------------------
// 정적 파라미터 생성 (ISR)
// ------------------------------------------------------------

export async function generateStaticParams() {
  const tutorials = await getTutorials();
  return tutorials.map((t) => ({ slug: t.slug }));
}

// ------------------------------------------------------------
// 동적 메타데이터
// ------------------------------------------------------------

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = await getTutorialBySlug(slug);

  if (!tutorial) {
    return { title: "튜토리얼을 찾을 수 없습니다" };
  }

  return {
    title: tutorial.title,
    description: tutorial.excerpt,
  };
}

// ------------------------------------------------------------
// 튜토리얼 상세 페이지 (Server Component)
// ------------------------------------------------------------

export default async function TutorialDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const tutorial = await getTutorialBySlug(slug);

  if (!tutorial) {
    notFound();
  }

  return (
    <section className="container mx-auto px-4 py-12">
      {/* 브레드크럼 */}
      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              홈
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/tutorials"
              className="hover:text-foreground transition-colors"
            >
              튜토리얼
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">
            {tutorial.title}
          </li>
        </ol>
      </nav>

      {/* 메인 + 사이드바 2컬럼 레이아웃 */}
      <div className="flex flex-col gap-10 md:flex-row">
        {/* 메인 콘텐츠 (2/3) */}
        <article className="min-w-0 flex-1 md:w-2/3">
          {/* 제목 */}
          <h1 className="text-3xl font-bold tracking-tight">
            {tutorial.title}
          </h1>

          {/* 난이도 + 소요시간 */}
          <div className="mt-4 flex items-center gap-3">
            <DifficultyBadge difficulty={tutorial.difficulty} />
            {tutorial.duration && (
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                {/* 시계 아이콘 */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {tutorial.duration}
              </span>
            )}
            {tutorial.category && (
              <span className="text-muted-foreground text-sm">
                {tutorial.category}
              </span>
            )}
          </div>

          <Separator className="my-6" />

          {/* YouTube 임베드 (URL이 있는 경우) */}
          {tutorial.youtubeUrl && (
            <div className="mb-8">
              <YoutubeEmbed url={tutorial.youtubeUrl} title={tutorial.title} />
            </div>
          )}

          {/* 본문 콘텐츠 (노션 마크다운) */}
          <ContentRenderer content={tutorial.content} />
        </article>

        {/* 사이드바 (1/3) */}
        <aside className="w-full shrink-0 md:w-1/3 md:max-w-sm">
          <div className="sticky top-24">
            <MaterialSidebar materials={tutorial.materials} />
          </div>
        </aside>
      </div>
    </section>
  );
}
