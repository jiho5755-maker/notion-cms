"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/price";
import { getNotionImageUrl } from "@/lib/image";
import type { MakeshopProduct } from "@/types";

interface ProductListProps {
  products: MakeshopProduct[];
  onAddItem: (product: MakeshopProduct) => void;
  isLoading?: boolean;
}

/** 상품 목록 컴포넌트 */
export function ProductList({
  products,
  onAddItem,
  isLoading = false,
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-muted" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        <p className="text-muted-foreground text-sm mt-2">
          다른 검색어로 시도해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.productId} className="flex flex-col">
          {/* 상품 이미지 */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Image
              src={getNotionImageUrl(product.imageUrl)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>

          {/* 상품 정보 */}
          <CardContent className="flex-1 p-4">
            <h3 className="font-medium line-clamp-2 mb-2">{product.name}</h3>
            <p className="text-lg font-semibold">
              {formatPrice(product.salePrice)}
            </p>
            {product.salePrice < product.price && (
              <p className="text-muted-foreground text-sm line-through">
                {formatPrice(product.price)}
              </p>
            )}
          </CardContent>

          {/* 추가 버튼 */}
          <CardFooter className="p-4 pt-0">
            <Button
              onClick={() => onAddItem(product)}
              className="w-full"
              variant="outline"
            >
              추가
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
