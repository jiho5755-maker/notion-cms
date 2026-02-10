import { cn } from "@/lib/utils";

interface ContentRendererProps {
  content: string;
  className?: string;
}

/**
 * NotCMS 콘텐츠를 렌더링하는 컴포넌트.
 * NotCMS는 HTML 문자열을 반환하므로 dangerouslySetInnerHTML로 렌더링한다.
 * @tailwindcss/typography 없이 자식 선택자로 기본 타이포그래피를 적용한다.
 */
export function ContentRenderer({ content, className }: ContentRendererProps) {
  // 빈 콘텐츠인 경우 렌더링하지 않음
  if (!content || content.trim().length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        // 기본 타이포그래피 스타일 (자식 선택자)
        "max-w-none leading-relaxed text-foreground",

        // 제목
        "[&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight",
        "[&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold",

        // 본문
        "[&_p]:mb-4 [&_p]:leading-7",

        // 링크
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors",
        "[&_a:hover]:text-primary/80",

        // 목록
        "[&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1",
        "[&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1",
        "[&_li]:leading-7",

        // 이미지
        "[&_img]:my-6 [&_img]:rounded-lg [&_img]:border",

        // 인용문
        "[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",

        // 코드
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono",
        "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",

        // 수평선
        "[&_hr]:my-8 [&_hr]:border-border",

        // 테이블
        "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse",
        "[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2",

        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
