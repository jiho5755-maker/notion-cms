"use client";

// ============================================================
// 매출 요약 카드 컴포넌트
// 총 매출, 주문 수, 고객 수, 평균 주문 금액을 표시한다.
// ============================================================

import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";
import type { SalesStats } from "@/types";
import { formatPrice } from "@/lib/price";

interface SalesOverviewProps {
  stats: SalesStats;
}

const statCards = [
  {
    name: "총 매출",
    key: "totalRevenue" as const,
    icon: DollarSign,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    format: (value: number) => formatPrice(value),
  },
  {
    name: "총 주문 수",
    key: "totalOrders" as const,
    icon: ShoppingCart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    format: (value: number) => `${value}건`,
  },
  {
    name: "총 고객 수",
    key: "totalCustomers" as const,
    icon: Users,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    format: (value: number) => `${value}명`,
  },
  {
    name: "평균 주문 금액",
    key: "averageOrderValue" as const,
    icon: TrendingUp,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    format: (value: number) => formatPrice(Math.round(value)),
  },
];

export function SalesOverview({ stats }: SalesOverviewProps) {
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
