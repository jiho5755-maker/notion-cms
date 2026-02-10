import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import type { Tutorial } from "@/types";

interface TutorialCardProps {
  tutorial: Tutorial;
  className?: string;
}

/** 튜토리얼 목록 페이지에서 사용하는 카드 컴포넌트 */
export function TutorialCard({ tutorial, className }: TutorialCardProps) {
  return (
    <Link
      href={`/tutorials/${tutorial.slug}`}
      className={cn("group block", className)}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {/* 커버 이미지 (16:9 비율) */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={`/api/notion-image?url=${encodeURIComponent(tutorial.coverImage)}`}
            alt={tutorial.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* 카테고리 + 난이도 배지 */}
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              {tutorial.category}
            </span>
            <DifficultyBadge difficulty={tutorial.difficulty} />
          </div>

          {/* 제목 */}
          <CardTitle className="text-base group-hover:underline">
            {tutorial.title}
          </CardTitle>

          {/* 요약 (최대 2줄) */}
          <CardDescription className="line-clamp-2">
            {tutorial.excerpt}
          </CardDescription>
        </CardHeader>

        {/* 소요시간 */}
        <CardFooter className="text-muted-foreground gap-1.5 text-sm">
          {/* 시계 아이콘 (SVG 인라인) */}
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
          <span>{tutorial.duration}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
