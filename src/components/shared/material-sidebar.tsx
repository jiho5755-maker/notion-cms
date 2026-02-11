"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/price";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Material } from "@/types";

interface MaterialSidebarProps {
  materials: Material[];
  className?: string;
}

/** 튜토리얼/조합 상세 페이지 우측에 표시하는 재료 사이드바 */
export function MaterialSidebar({ materials, className }: MaterialSidebarProps) {
  /**
   * 모든 재료를 메이크샵 장바구니에 한 번에 추가
   * URL Scheme: /order/cart.html?product[]=123&product[]=456
   */
  const handleAddAllToCart = () => {
    // makeshopProductId가 있는 재료만 필터링
    const availableProducts = materials.filter((m) => m.makeshopProductId);

    if (availableProducts.length === 0) {
      toast.error("장바구니에 추가할 수 있는 상품이 없습니다", {
        description: "메이크샵 상품 ID가 설정되지 않았습니다",
      });
      return;
    }

    // 메이크샵 장바구니 URL 생성
    const cartUrl = new URL("https://www.foreverlove.co.kr/order/cart.html");
    availableProducts.forEach((product) => {
      cartUrl.searchParams.append("product[]", product.makeshopProductId!);
    });

    // 새 창에서 장바구니 열기
    window.open(cartUrl.toString(), "_blank", "noopener,noreferrer");

    toast.success(
      `${availableProducts.length}개 상품을 장바구니에 추가했습니다`,
      {
        description: "메이크샵 쇼핑몰에서 확인하세요",
      }
    );
  };

  // makeshopProductId가 있는 재료 개수
  const availableCount = materials.filter((m) => m.makeshopProductId).length;

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
        <>
          {/* "한 번에 담기" 버튼 — makeshopProductId가 있는 재료가 있을 때만 표시 */}
          {availableCount > 0 && (
            <>
              <Button
                onClick={handleAddAllToCart}
                className="w-full mb-4"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                모든 재료 한 번에 담기 ({availableCount}개)
              </Button>
              <Separator className="my-4" />
            </>
          )}

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
        </>
      )}
    </aside>
  );
}
