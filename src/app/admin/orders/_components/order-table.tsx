"use client";

// ============================================================
// 주문 테이블 컴포넌트
// 주문 목록을 테이블 형식으로 표시한다.
// ============================================================

import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Order, OrderStatus, PaymentMethod } from "@/types";
import { ORDER_STATUS_COLORS } from "@/types";
import { formatPrice } from "@/lib/price";
import { cn } from "@/lib/utils";
import { OrderFilter } from "./order-filter";

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  // 필터링된 주문 목록
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 상태 필터
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // 결제 수단 필터
      if (
        paymentFilter !== "all" &&
        order.paymentMethod !== paymentFilter
      ) {
        return false;
      }

      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [orders, statusFilter, paymentFilter, searchQuery]);

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          등록된 주문이 없습니다.
        </p>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          노션에서 첫 주문을 추가해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <OrderFilter
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onPaymentChange={setPaymentFilter}
      />

      {/* 결과 수 */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {filteredOrders.length}건의 주문이 검색되었습니다.
      </p>

      {/* 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  주문번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  고객명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  주문일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  주문 금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  결제 수단
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  상세
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.customerName || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.orderDate).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                        ORDER_STATUS_COLORS[order.status as OrderStatus],
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
