import type { Metadata } from "next";
import { getOrders, getCustomers } from "@/lib/customer";
import { calculateOrderStats } from "@/lib/order-stats";
import { OrderStats } from "./_components/order-stats";
import { OrderTable } from "./_components/order-table";

export const metadata: Metadata = {
  title: "주문 관리 | Admin | PRESSCO 21",
  description: "주문 목록 및 통계를 확인하고 관리합니다.",
};

export default async function OrdersPage() {
  // 주문 및 고객 데이터 조회 (병렬)
  const [orders, customers] = await Promise.all([
    getOrders(),
    getCustomers(),
  ]);

  // 통계 계산
  const stats = calculateOrderStats(orders);

  // 주문에 고객명 추가 (조인)
  const ordersWithCustomerName = orders.map((order) => {
    const customer = customers.find((c) => c.id === order.customerId);
    return {
      ...order,
      customerName: customer?.name,
    };
  });

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          주문 관리
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          주문 목록을 확인하고 통계를 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <OrderStats stats={stats} />

      {/* 주문 테이블 */}
      <OrderTable orders={ordersWithCustomerName} />
    </div>
  );
}
