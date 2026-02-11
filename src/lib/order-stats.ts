/**
 * 주문 통계 계산 함수
 * - 주문 목록을 받아서 통계 데이터를 계산한다.
 */

import type { Order } from "@/types";

export interface OrderStats {
  /** 전체 주문 수 */
  totalOrders: number;
  /** 전체 매출액 */
  totalRevenue: number;
  /** 오늘 주문 수 */
  todayOrders: number;
  /** 오늘 매출액 */
  todayRevenue: number;
  /** 미배송 주문 수 (결제 완료 ~ 배송 중) */
  pendingOrders: number;
  /** 취소/환불 주문 수 */
  canceledOrders: number;
}

/**
 * 주문 목록에서 통계를 계산한다.
 */
export function calculateOrderStats(orders: Order[]): OrderStats {
  const today = new Date().toISOString().split("T")[0];

  const todayOrders = orders.filter((order) =>
    order.orderDate.startsWith(today),
  );

  const pendingStatuses = ["결제 대기", "결제 완료", "배송 준비", "배송 중"];
  const canceledStatuses = ["취소", "환불"];

  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    ),
    pendingOrders: orders.filter((order) =>
      pendingStatuses.includes(order.status),
    ).length,
    canceledOrders: orders.filter((order) =>
      canceledStatuses.includes(order.status),
    ).length,
  };
}
