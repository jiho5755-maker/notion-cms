import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Material } from "@/types";

interface MaterialSidebarProps {
  materials: Material[];
  className?: string;
}

/** 가격을 한국어 원화 형식으로 포맷한다 (예: 12,000원) */
function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(price)}원`;
}

/** 튜토리얼/조합 상세 페이지 우측에 표시하는 재료 사이드바 */
export function MaterialSidebar({ materials, className }: MaterialSidebarProps) {
  return (
    <aside
      className={cn(
        "rounded-lg border bg-card p-6",
        className
      )}
    >
      {/* 제목 */}
      <h3 className="text-lg font-semibold">필요한 재료</h3>
      <Separator className="my-4" />

      {/* 재료가 없는 경우 */}
      {materials.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          연결된 재료가 없습니다
        </p>
      ) : (
        <ul className="space-y-4">
          {materials.map((material) => (
            <li
              key={material.id}
              className="flex items-start justify-between gap-3"
            >
              {/* 재료 정보 */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">
                  {material.title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {formatPrice(material.price)}
                </p>
              </div>

              {/* 메이크샵 링크 버튼 */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="shrink-0"
              >
                <a
                  href={material.makeshopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* 외부 링크 아이콘 */}
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
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                  <span>구매</span>
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
