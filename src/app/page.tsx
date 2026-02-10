import Link from "next/link";
import Image from "next/image";
import {
  Flower2,
  BookOpen,
  Palette,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { getTutorials, getCombos, getSeasons } from "@/lib/notion";
import { TutorialCard } from "@/components/shared/tutorial-card";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ------------------------------------------------------------
// 홈 페이지 — PRESSCO 21 콘텐츠 허브 랜딩
// ------------------------------------------------------------

export default async function HomePage() {
  // 모든 데이터를 병렬로 가져온다
  const [tutorials, combos, seasons] = await Promise.all([
    getTutorials(),
    getCombos(),
    getSeasons(),
  ]);

  // 각 최대 3개씩 표시
  const latestTutorials = tutorials.slice(0, 3);
  const popularCombos = combos.slice(0, 3);
  // 시즌 캠페인 배너용 (최신 1개)
  const activeSeason = seasons[0] ?? null;

  return (
    <div className="flex flex-col">
      {/* ========================================== */}
      {/* 1) 히어로 섹션 */}
      {/* ========================================== */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* 장식 요소 */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-900/20" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/20" />

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
          {/* 브랜드 마크 */}
          <div className="flex items-center gap-3">
            <Flower2 className="size-10 text-rose-500" />
            <span className="text-xl font-semibold tracking-wider text-rose-600 dark:text-rose-400">
              PRESSCO 21
            </span>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-50">
            꽃으로 노는 모든 방법
          </h1>

          {/* 서브 텍스트 */}
          <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
            압화 전문 콘텐츠 허브 — 튜토리얼, 재료 조합 가이드, 시즌 캠페인까지
            한곳에서 만나보세요.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/tutorials">
                <BookOpen className="size-4" />
                튜토리얼 보기
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/combos">
                <Palette className="size-4" />
                재료 조합 가이드
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2) 최신 튜토리얼 섹션 */}
      {/* ========================================== */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          {/* 섹션 헤더 */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                최신 튜토리얼
              </h2>
              <p className="mt-1 text-muted-foreground">
                단계별 압화 만들기 가이드
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tutorials" className="gap-1">
                전체 보기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* 튜토리얼 카드 그리드 */}
          {latestTutorials.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <BookOpen className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                아직 등록된 튜토리얼이 없습니다.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                노션에서 튜토리얼을 작성하면 자동으로 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================== */}
      {/* 3) 인기 재료 조합 섹션 */}
      {/* ========================================== */}
      <section className="border-t bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          {/* 섹션 헤더 */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                인기 재료 조합
              </h2>
              <p className="mt-1 text-muted-foreground">
                이 꽃 + 이 도구 = 이 작품
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/combos" className="gap-1">
                전체 보기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* 조합 카드 그리드 */}
          {popularCombos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularCombos.map((combo) => (
                <Card
                  key={combo.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* 썸네일 */}
                  {combo.thumbnails[0] && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={`/api/notion-image?url=${encodeURIComponent(combo.thumbnails[0])}`}
                        alt={combo.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={combo.difficulty} />
                    </div>
                    <CardTitle className="text-base">
                      {combo.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {combo.excerpt}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Palette className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                아직 등록된 재료 조합이 없습니다.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                노션에서 재료 조합을 작성하면 자동으로 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================== */}
      {/* 4) 시즌 캠페인 배너 (데이터가 있을 때만) */}
      {/* ========================================== */}
      {activeSeason && (
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="relative overflow-hidden rounded-2xl">
              {/* 배경 이미지 */}
              {activeSeason.heroImage && (
                <Image
                  src={`/api/notion-image?url=${encodeURIComponent(activeSeason.heroImage)}`}
                  alt={activeSeason.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1152px"
                  className="object-cover"
                />
              )}

              {/* 오버레이 + 콘텐츠 */}
              <div className="relative flex min-h-[300px] flex-col items-start justify-center gap-4 bg-black/50 p-8 md:min-h-[360px] md:p-12">
                {/* 기간 배지 */}
                {activeSeason.period && (
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white backdrop-blur-sm"
                  >
                    {activeSeason.period}
                  </Badge>
                )}

                {/* 제목 */}
                <h2 className="max-w-lg text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {activeSeason.title}
                </h2>

                {/* 설명 */}
                {activeSeason.excerpt && (
                  <p className="max-w-md text-white/90">
                    {activeSeason.excerpt}
                  </p>
                )}

                {/* CTA */}
                <Button size="lg" asChild>
                  <Link href={`/seasons/${activeSeason.slug}`}>
                    자세히 보기
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 5) 쇼핑몰 안내 섹션 */}
      {/* ========================================== */}
      <section className="border-t bg-muted/30 py-16 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 text-center">
          <ShoppingBag className="size-10 text-rose-500" />
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            온라인 쇼핑몰에서 만나보세요
          </h2>
          <p className="text-muted-foreground">
            압화 재료, 도구, 만들기 키트를 한곳에서 구매할 수 있습니다.
          </p>
          <Button variant="outline" size="lg" asChild>
            <a
              href="https://www.foreverlove.co.kr"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.foreverlove.co.kr
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
