"use client";

// ============================================================
// 주문 상세 정보 카드 컴포넌트
// 주문 기본 정보, 배송지, 메모를 표시한다.
// ============================================================

import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_COLORS } from "@/types";
import { formatPrice } from "@/lib/price";
import { cn } from "@/lib/utils";

interface OrderDetailCardProps {
  order: Order;
  customerName?: string;
}

export function OrderDetailCard({
  order,
  customerName,
}: OrderDetailCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      {/* 주문 기본 정보 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          주문 정보
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              주문번호
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              고객명
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {customerName || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              주문일
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(order.orderDate).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              결제 수단
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {order.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              총 주문 금액
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              주문 상태
            </span>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                ORDER_STATUS_COLORS[order.status as OrderStatus],
              )}
            >
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* 배송지 정보 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
          배송지
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {order.shippingAddress || "배송지 정보 없음"}
        </p>
      </div>

      {/* 메모 */}
      {order.memo && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            메모
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {order.memo}
          </p>
        </div>
      )}
    </div>
  );
}
