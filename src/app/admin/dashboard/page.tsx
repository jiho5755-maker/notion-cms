// ============================================================
// 매출 대시보드 페이지
// 전체 매출 현황 및 통계를 표시한다.
// ============================================================

import type { Metadata } from "next";
import { getCustomers, getOrders } from "@/lib/customer";
import { calculateSalesStats } from "@/lib/sales-stats";
import { getTopFAQs } from "@/lib/faq";
import { SalesOverview } from "./_components/sales-overview";
import { SalesChart } from "./_components/sales-chart";
import { TopCustomers } from "./_components/top-customers";
import { TopProducts } from "./_components/top-products";
import { TopFAQs } from "./_components/top-faqs";

export const metadata: Metadata = {
  title: "대시보드 - 관리자",
  description: "매출 현황 및 통계",
};

export default async function DashboardPage() {
  const [customers, orders, topFAQs] = await Promise.all([
    getCustomers(),
    getOrders(),
    getTopFAQs(),
  ]);

  const stats = calculateSalesStats(customers, orders);

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          매출 대시보드
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          전체 매출 현황 및 통계를 확인하세요.
        </p>
      </div>

      {/* 매출 요약 카드 */}
      <SalesOverview stats={stats} />

      {/* 일별 매출 차트 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          일별 매출 추이 (최근 30일)
        </h2>
        <SalesChart data={stats.dailySales} />
      </div>

      {/* 상위 고객 & 인기 상품 */}
      <div className="grid gap-8 md:grid-cols-2">
        <TopCustomers customers={stats.topCustomers} />
        <TopProducts products={stats.topProducts} />
      </div>

      {/* 인기 FAQ Top 10 */}
      <TopFAQs faqs={topFAQs} />
    </div>
  );
}
