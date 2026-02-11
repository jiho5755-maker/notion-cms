"use client";

// ============================================================
// 주문 통계 카드 컴포넌트
// 오늘 주문, 오늘 매출, 미배송, 취소/환불 통계를 표시한다.
// ============================================================

import { ShoppingCart, TrendingUp, Package, XCircle } from "lucide-react";
import type { OrderStats } from "@/lib/order-stats";
import { formatPrice } from "@/lib/price";

interface OrderStatsProps {
  stats: OrderStats;
}

const statCards = [
  {
    name: "오늘 주문",
    key: "todayOrders" as const,
    icon: ShoppingCart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    format: (value: number) => `${value}건`,
  },
  {
    name: "오늘 매출",
    key: "todayRevenue" as const,
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    format: (value: number) => formatPrice(value),
  },
  {
    name: "미배송",
    key: "pendingOrders" as const,
    icon: Package,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    format: (value: number) => `${value}건`,
  },
  {
    name: "취소/환불",
    key: "canceledOrders" as const,
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    format: (value: number) => `${value}건`,
  },
];

export function OrderStats({ stats }: OrderStatsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];

        return (
          <div
            key={card.name}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.name}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {card.format(value)}
                </p>
              </div>
              <div className={`rounded-full p-3 ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
