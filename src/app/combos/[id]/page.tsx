import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCombos, getComboById } from "@/lib/notion";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { MaterialSidebar } from "@/components/shared/material-sidebar";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { Separator } from "@/components/ui/separator";
import {
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/json-ld";
import type { BreadcrumbItem } from "@/lib/json-ld";

// 로컬 타입 정의 — Combos는 id를 사용
interface ComboPageParams {
  params: Promise<{ id: string }>;
}

// ------------------------------------------------------------
// 정적 파라미터 생성 (ISR)
// ------------------------------------------------------------

export async function generateStaticParams() {
  const combos = await getCombos();
  return combos.map((combo) => ({ id: combo.id }));
}

// ------------------------------------------------------------
// 동적 메타데이터
// ------------------------------------------------------------

export async function generateMetadata({
  params,
}: ComboPageParams): Promise<Metadata> {
  const { id } = await params;
  const combo = await getComboById(id);

  if (!combo) {
    return { title: "재료 조합을 찾을 수 없습니다" };
  }

  // Open Graph 이미지: 첫 번째 썸네일 또는 기본 이미지
  const ogImage = combo.thumbnails[0] || "/images/og-default.png";

  return {
    title: combo.title,
    description: combo.excerpt,
    openGraph: {
      title: combo.title,
      description: combo.excerpt,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: combo.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: combo.title,
      description: combo.excerpt,
      images: [ogImage],
    },
  };
}

// ------------------------------------------------------------
// 재료 조합 상세 페이지 (Server Component)
// ------------------------------------------------------------

export default async function ComboDetailPage({ params }: ComboPageParams) {
  const { id } = await params;
  const combo = await getComboById(id);

  if (!combo) {
    notFound();
  }

  // BreadcrumbList JSON-LD
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: "홈", url: "/" },
    { name: "재료 조합 가이드", url: "/combos" },
    { name: combo.title, url: `/combos/${combo.id}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  // WebPage JSON-LD
  const webPageJsonLd = generateWebPageJsonLd({
    name: combo.title,
    description: combo.excerpt,
    url: `/combos/${combo.id}`,
    image: combo.thumbnails[0],
  });

  return (
    <>
      {/* JSON-LD 스크립트 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="container mx-auto px-4 py-12">
        {/* 브레드크럼 */}
        <nav aria-label="breadcrumb" className="mb-8">
          <ol className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                홈
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/combos"
                className="hover:text-foreground transition-colors"
              >
                재료 조합 가이드
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium" aria-current="page">
              {combo.title}
            </li>
          </ol>
        </nav>

        {/* 메인 + 사이드바 2컬럼 레이아웃 */}
        <div className="flex flex-col gap-10 md:flex-row">
          {/* 메인 콘텐츠 (2/3) */}
          <article className="min-w-0 flex-1 md:w-2/3">
            {/* 제목 */}
            <h1 className="text-3xl font-bold tracking-tight">
              {combo.title}
            </h1>

            {/* 난이도 + 재료 수 */}
            <div className="mt-4 flex items-center gap-3">
              <DifficultyBadge difficulty={combo.difficulty} />
              {combo.materials.length > 0 && (
                <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  {/* 태그 아이콘 */}
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
                    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                    <path d="M7 7h.01" />
                  </svg>
                  재료 {combo.materials.length}종
                </span>
              )}
            </div>

            <Separator className="my-6" />

            {/* 본문 콘텐츠 (노션 마크다운) */}
            <ContentRenderer content={combo.content} />

            {/* 관련 튜토리얼 섹션 */}
            {combo.tutorials.length > 0 && (
              <>
                <Separator className="my-10" />
                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    이 조합을 사용하는 튜토리얼
                  </h2>
                  <ul className="space-y-3">
                    {combo.tutorials.map((tutorial) => (
                      <li key={tutorial.id}>
                        <Link
                          href={`/tutorials/${tutorial.slug}`}
                          className="hover:text-foreground text-muted-foreground block rounded-md border p-4 transition-colors hover:border-foreground"
                        >
                          <span className="font-medium">{tutorial.title}</span>
                          <span
                            className="ml-2 inline-block text-sm"
                            aria-label="튜토리얼 보기"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </article>

          {/* 사이드바 (1/3) */}
          <aside className="w-full shrink-0 md:w-1/3 md:max-w-sm">
            <div className="sticky top-24">
              <MaterialSidebar materials={combo.materials} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
