import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCombos, getComboById } from "@/lib/notion";
import { getNotionImageUrl } from "@/lib/image";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { MaterialSidebar } from "@/components/shared/material-sidebar";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/json-ld";
import type { WebPageInput, BreadcrumbItem } from "@/lib/json-ld";

// ------------------------------------------------------------
// 타입 (combos/[id]는 slug가 아닌 id를 사용)
// ------------------------------------------------------------

interface ComboPageParams {
  params: Promise<{ id: string }>;
}

// ------------------------------------------------------------
// 정적 파라미터 생성 (ISR)
// ------------------------------------------------------------

export async function generateStaticParams() {
  const combos = await getCombos();
  return combos.map((c) => ({ id: c.id }));
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

  return {
    title: combo.title,
    description: combo.excerpt,
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

  // "한 번에 구매" 버튼 활성 조건: 재료 중 하나라도 메이크샵 URL이 있으면
  const hasPurchasableItems = combo.materials.some(
    (m) => m.makeshopUrl && m.makeshopUrl.length > 0,
  );

  // BreadcrumbList JSON-LD
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: "홈", url: "/" },
    { name: "재료 조합", url: "/combos" },
    { name: combo.title, url: `/combos/${combo.id}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  // WebPage JSON-LD
  const comboPage: WebPageInput = {
    name: combo.title,
    description: combo.excerpt,
    url: `/combos/${combo.id}`,
    image: combo.thumbnails[0] || "",
    dateModified: combo.createdAt,
  };
  const webPageJsonLd = generateWebPageJsonLd(comboPage);

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
            <Link href="/" className="hover:text-foreground transition-colors">
              홈
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/combos"
              className="hover:text-foreground transition-colors"
            >
              재료 조합
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
          <h1 className="text-3xl font-bold tracking-tight">{combo.title}</h1>

          {/* 난이도 배지 */}
          <div className="mt-4 flex items-center gap-3">
            <DifficultyBadge difficulty={combo.difficulty} />
          </div>

          <Separator className="my-6" />

          {/* 썸네일 이미지들 */}
          {combo.thumbnails.length > 0 && (
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {combo.thumbnails.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={getNotionImageUrl(url)}
                    alt={`${combo.title} 이미지 ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 본문 콘텐츠 (노션 마크다운) */}
          <ContentRenderer content={combo.content} />

          {/* 관련 튜토리얼 섹션 */}
          {combo.tutorials.length > 0 && (
            <div className="mt-12">
              <Separator className="mb-8" />
              <h2 className="mb-6 text-xl font-semibold">관련 튜토리얼</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {combo.tutorials.map((tutorial) => (
                  <Link
                    key={tutorial.id}
                    href={`/tutorials/${tutorial.slug}`}
                    className="group block"
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-sm group-hover:underline">
                          {tutorial.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          튜토리얼 보기 &rarr;
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* 사이드바 (1/3) */}
        <aside className="w-full shrink-0 md:w-1/3 md:max-w-sm">
          <div className="sticky top-24 space-y-6">
            {/* 재료 사이드바 */}
            <MaterialSidebar materials={combo.materials} />

            {/* "한 번에 구매" 버튼 */}
            {combo.materials.length > 0 && (
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground mb-3 text-sm">
                  이 조합에 필요한 재료를 한 번에 구매하세요.
                </p>
                {hasPurchasableItems ? (
                  <Button asChild className="w-full">
                    <a
                      href={combo.materials[0].makeshopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {/* 장바구니 아이콘 */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                      한 번에 구매하기
                    </a>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    구매 링크 준비 중
                  </Button>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
      </section>
    </>
  );
}
