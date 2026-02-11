"use client";

// ============================================================
// 주문 상품 목록 테이블 컴포넌트
// 주문에 포함된 상품 목록을 테이블로 표시한다.
// ============================================================

import type { OrderItem } from "@/types";
import { formatPrice } from "@/lib/price";

interface OrderItemsTableProps {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">상품 정보 없음</p>
      </div>
    );
  }

  // 총 수량 및 총 금액 계산
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          주문 상품 목록
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                상품명
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                단가
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                수량
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                소계
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                  {formatPrice(item.price)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}

            {/* 합계 행 */}
            <tr className="bg-gray-50 dark:bg-gray-700">
              <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                합계
              </td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {totalQuantity}
              </td>
              <td className="px-6 py-4 text-right text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
