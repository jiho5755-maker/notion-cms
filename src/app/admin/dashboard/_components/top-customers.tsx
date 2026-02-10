"use client";

// ============================================================
// 상위 고객 컴포넌트
// 총 구매 금액 기준 상위 5명 고객을 표시한다.
// ============================================================

import Link from "next/link";
import { Crown } from "lucide-react";
import type { TopCustomer } from "@/types";
import { formatPrice } from "@/lib/price";

interface TopCustomersProps {
  customers: TopCustomer[];
}

export function TopCustomers({ customers }: TopCustomersProps) {
  if (customers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          상위 고객 Top 5
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
        상위 고객 Top 5
      </h2>

      <div className="space-y-4">
        {customers.map((customer, index) => (
          <Link
            key={customer.id}
            href={`/admin/customers/${customer.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* 순위 */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                {index === 0 ? (
                  <Crown className="h-4 w-4 text-yellow-500" />
                ) : (
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* 고객 정보 */}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {customer.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {customer.totalOrders}건
                </p>
              </div>
            </div>

            {/* 금액 */}
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(customer.totalAmount)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
