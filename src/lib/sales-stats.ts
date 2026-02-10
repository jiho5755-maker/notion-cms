// ============================================================
// PRESSCO 21 — 매출 통계 계산 함수
// 고객/주문 데이터를 분석하여 대시보드용 통계를 생성한다.
// ============================================================

import type {
  Customer,
  Order,
  SalesStats,
  DailySales,
  TopCustomer,
  TopProduct,
} from "@/types";

/**
 * 고객 및 주문 데이터를 기반으로 매출 통계를 계산한다.
 */
export function calculateSalesStats(
  customers: Customer[],
  orders: Order[],
): SalesStats {
  // 1. 기본 통계
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 2. 일별 매출 (최근 30일)
  const dailySalesMap = new Map<string, number>();
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  orders.forEach((order) => {
    const date = order.orderDate.split("T")[0]; // YYYY-MM-DD 형식
    const orderDate = new Date(date);

    if (orderDate >= thirtyDaysAgo && orderDate <= today) {
      dailySalesMap.set(
        date,
        (dailySalesMap.get(date) || 0) + order.totalAmount,
      );
    }
  });

  const dailySales: DailySales[] = Array.from(dailySalesMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 3. 상위 5명 고객 (총 구매 금액 기준)
  const topCustomers: TopCustomer[] = customers
    .filter((c) => c.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      name: c.name,
      totalAmount: c.totalAmount,
      totalOrders: c.totalOrders,
    }));

  // 4. 인기 상품 Top 5 (판매 수량 기준)
  const productMap = new Map<
    string,
    { totalQuantity: number; totalAmount: number }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productMap.get(item.name) || {
        totalQuantity: 0,
        totalAmount: 0,
      };
      productMap.set(item.name, {
        totalQuantity: existing.totalQuantity + item.quantity,
        totalAmount: existing.totalAmount + item.price * item.quantity,
      });
    });
  });

  const topProducts: TopProduct[] = Array.from(productMap.entries())
    .map(([name, data]) => ({
      name,
      totalQuantity: data.totalQuantity,
      totalAmount: data.totalAmount,
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    averageOrderValue,
    dailySales,
    topCustomers,
    topProducts,
  };
}
