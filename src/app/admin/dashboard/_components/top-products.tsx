"use client";

// ============================================================
// 인기 상품 컴포넌트
// 판매 수량 기준 인기 상품 Top 5를 표시한다.
// ============================================================

import { Package } from "lucide-react";
import type { TopProduct } from "@/types";
import { formatPrice } from "@/lib/price";

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          인기 상품 Top 5
        </h2>
        <div className="flex h-48 items-center justify-center text-gray-500 dark:text-gray-400">
          데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        인기 상품 Top 5
      </h2>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.name}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* 순위 */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                {index === 0 ? (
                  <Package className="h-4 w-4 text-blue-500" />
                ) : (
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* 상품 정보 */}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {product.totalQuantity}개 판매
                </p>
              </div>
            </div>

            {/* 금액 */}
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(product.totalAmount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
