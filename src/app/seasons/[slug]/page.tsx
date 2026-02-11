import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { getSeasons, getSeasonBySlug } from "@/lib/notion";
import { getNotionImageUrl } from "@/lib/image";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/json-ld";
import type { PageParams } from "@/types";
import type { WebPageInput, BreadcrumbItem } from "@/lib/json-ld";

// ------------------------------------------------------------
// ISR: 정적 경로 사전 생성
// ------------------------------------------------------------

export async function generateStaticParams() {
  const seasons = await getSeasons();
  return seasons.map((season) => ({ slug: season.slug }));
}

// ------------------------------------------------------------
// 동적 메타데이터
// ------------------------------------------------------------

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const season = await getSeasonBySlug(slug);

  if (!season) {
    return { title: "시즌 캠페인을 찾을 수 없습니다" };
  }

  // Open Graph 이미지: heroImage가 있으면 사용, 없으면 기본 이미지
  const ogImage = season.heroImage || "/images/og-default.png";

  return {
    title: `${season.title} | PRESSCO 21`,
    description: season.excerpt,
    openGraph: {
      title: season.title,
      description: season.excerpt,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: season.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: season.title,
      description: season.excerpt,
      images: [ogImage],
    },
  };
}

// ------------------------------------------------------------
// 시즌 캠페인 상세 페이지
// ------------------------------------------------------------

export default async function SeasonDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const season = await getSeasonBySlug(slug);

  if (!season) {
    notFound();
  }

  // BreadcrumbList JSON-LD
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: "홈", url: "/" },
    { name: "시즌 캠페인", url: "/seasons" },
    { name: season.title, url: `/seasons/${season.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  // WebPage JSON-LD
  const seasonPage: WebPageInput = {
    name: season.title,
    description: season.excerpt,
    url: `/seasons/${season.slug}`,
    image: season.heroImage,
    dateModified: season.createdAt,
  };
  const webPageJsonLd = generateWebPageJsonLd(seasonPage);

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

      <div className="flex flex-col">
      {/* 히어로 섹션 */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden md:min-h-[60vh]">
        {/* 배경 이미지 */}
        <Image
          src={getNotionImageUrl(season.heroImage)}
          alt={season.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* 반투명 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/50" />

        {/* 오버레이 텍스트 */}
        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-4 px-6 text-center text-white">
          {/* 기간 배지 */}
          {season.period && (
            <Badge
              variant="secondary"
              className="gap-1.5 bg-white/20 text-white backdrop-blur-sm"
            >
              <CalendarDays className="size-3.5" />
              {season.period}
            </Badge>
          )}

          {/* 제목 */}
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {season.title}
          </h1>

          {/* 요약 설명 */}
          {season.excerpt && (
            <p className="max-w-xl text-lg text-white/90 md:text-xl">
              {season.excerpt}
            </p>
          )}
        </div>
      </section>

      {/* 콘텐츠 섹션 */}
      <section className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
        {/* 뒤로 가기 링크 */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seasons" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="size-4" />
              시즌 캠페인 목록
            </Link>
          </Button>
        </div>

        {/* 노션 CMS 콘텐츠 */}
        <ContentRenderer content={season.content} />
      </section>

      {/* 관련 튜토리얼 섹션 — 튜토리얼이 있을 때만 표시 */}
      {season.tutorials.length > 0 && (
        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">
              추천 튜토리얼
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {season.tutorials.map((tutorial) => (
                <Link
                  key={tutorial.id}
                  href={`/tutorials/${tutorial.slug}`}
                  className="group block"
                >
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    {/* 커버 이미지 */}
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={getNotionImageUrl(tutorial.coverImage)}
                        alt={tutorial.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base group-hover:underline">
                        {tutorial.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      </div>
    </>
  );
}
