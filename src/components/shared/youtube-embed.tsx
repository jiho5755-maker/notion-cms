"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface YoutubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

/**
 * 유튜브 URL에서 video ID를 추출한다.
 * 지원 형식: watch, youtu.be 단축, embed
 */
function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    // youtube.com/watch?v=VIDEO_ID
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      return parsed.searchParams.get("v");
    }

    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }

    // youtube.com/embed/VIDEO_ID
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return parsed.pathname.replace("/embed/", "").split("/")[0] || null;
    }

    return null;
  } catch {
    // 유효하지 않은 URL
    return null;
  }
}

/** 유튜브 영상을 16:9 비율로 임베드하는 컴포넌트 */
export function YoutubeEmbed({ url, title, className }: YoutubeEmbedProps) {
  const videoId = extractVideoId(url);

  // 유효하지 않은 URL이면 렌더링하지 않음
  if (!videoId) {
    return null;
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-lg", className)}>
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title ?? "YouTube 영상"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </AspectRatio>
    </div>
  );
}
