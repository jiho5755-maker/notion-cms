import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCombos } from "@/lib/notion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";

// ------------------------------------------------------------
// 메타데이터
// ------------------------------------------------------------

export const metadata: Metadata = {
  title: "재료 조합 가이드",
  description:
    "검증된 재료 조합으로 완성도 높은 압화 작품을 만들어 보세요. 필요한 재료를 한 번에 확인하고 구매할 수 있습니다.",
};

// ------------------------------------------------------------
// 재료 조합 갤러리 페이지 (Server Component)
// ------------------------------------------------------------

export default async function CombosPage() {
  const combos = await getCombos();

  return (
    <section className="container mx-auto px-4 py-12">
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">재료 조합 가이드</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          검증된 재료 조합으로 완성도 높은 압화 작품을 만들어 보세요. 필요한
          재료를 한 번에 확인하고 구매할 수 있습니다.
        </p>
      </div>

      {/* 조합이 없는 경우 */}
      {combos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24">
          <p className="text-muted-foreground">
            아직 등록된 재료 조합이 없습니다.
          </p>
        </div>
      ) : (
        /* 갤러리 그리드 */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => (
            <Link
              key={combo.id}
              href={`/combos/${combo.id}`}
              className="group block"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                {/* 썸네일 이미지 (첫번째) */}
                {combo.thumbnails.length > 0 && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={`/api/notion-image?url=${encodeURIComponent(combo.thumbnails[0])}`}
                      alt={combo.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                <CardHeader>
                  {/* 난이도 배지 */}
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={combo.difficulty} />
                    {combo.materials.length > 0 && (
                      <span className="text-muted-foreground text-xs">
                        재료 {combo.materials.length}종
                      </span>
                    )}
                  </div>

                  {/* 제목 */}
                  <CardTitle className="text-base group-hover:underline">
                    {combo.title}
                  </CardTitle>

                  {/* 요약 (최대 2줄) */}
                  <CardDescription className="line-clamp-2">
                    {combo.excerpt}
                  </CardDescription>
                </CardHeader>

                {/* 연결된 튜토리얼 수 표시 */}
                {combo.tutorials.length > 0 && (
                  <CardContent>
                    <p className="text-muted-foreground text-xs">
                      관련 튜토리얼 {combo.tutorials.length}개
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
