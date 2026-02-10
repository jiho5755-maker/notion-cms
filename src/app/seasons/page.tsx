import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSeasons } from "@/lib/notion";
import { getNotionImageUrl } from "@/lib/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";

// ------------------------------------------------------------
// 메타데이터
// ------------------------------------------------------------

export const metadata: Metadata = {
  title: "시즌 캠페인",
  description:
    "계절과 이벤트에 맞춘 특별한 압화 프로젝트를 만나보세요. 시즌별 추천 튜토리얼과 재료를 제공합니다.",
};

// ------------------------------------------------------------
// 시즌 캠페인 목록 페이지 (Server Component)
// ------------------------------------------------------------

export default async function SeasonsPage() {
  const seasons = await getSeasons();

  return (
    <section className="container mx-auto px-4 py-12">
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">시즌 캠페인</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          계절과 이벤트에 맞춘 특별한 압화 프로젝트를 만나보세요. 시즌별 추천
          튜토리얼과 재료를 제공합니다.
        </p>
      </div>

      {/* 시즌이 없는 경우 */}
      {seasons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24">
          <p className="text-muted-foreground">
            아직 등록된 시즌 캠페인이 없습니다.
          </p>
        </div>
      ) : (
        /* 시즌 그리드 */
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {seasons.map((season) => (
            <Link
              key={season.id}
              href={`/seasons/${season.slug}`}
              className="group block"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                {/* 히어로 이미지 */}
                <div className="relative aspect-[21/9] overflow-hidden">
                  <Image
                    src={getNotionImageUrl(season.heroImage)}
                    alt={season.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                <CardHeader>
                  {/* 기간 표시 */}
                  {season.period && (
                    <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{season.period}</span>
                    </div>
                  )}

                  {/* 제목 */}
                  <CardTitle className="text-xl group-hover:underline">
                    {season.title}
                  </CardTitle>

                  {/* 요약 (최대 2줄) */}
                  <CardDescription className="line-clamp-2">
                    {season.excerpt}
                  </CardDescription>

                  {/* 튜토리얼 수 */}
                  {season.tutorials.length > 0 && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      튜토리얼 {season.tutorials.length}개
                    </p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
