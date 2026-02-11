"use client";

// ============================================================
// 주문 필터 컴포넌트
// 주문 상태, 결제 수단, 검색을 제공한다.
// ============================================================

import type { OrderStatus, PaymentMethod } from "@/types";

interface OrderFilterProps {
  searchQuery: string;
  statusFilter: OrderStatus | "all";
  paymentFilter: PaymentMethod | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrderStatus | "all") => void;
  onPaymentChange: (value: PaymentMethod | "all") => void;
}

export function OrderFilter({
  searchQuery,
  statusFilter,
  paymentFilter,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
}: OrderFilterProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* 검색 */}
      <input
        type="text"
        placeholder="주문번호, 고객명 검색..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />

      {/* 상태 필터 */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as OrderStatus | "all")}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="all">전체 상태</option>
        <option value="결제 대기">결제 대기</option>
        <option value="결제 완료">결제 완료</option>
        <option value="배송 준비">배송 준비</option>
        <option value="배송 중">배송 중</option>
        <option value="배송 완료">배송 완료</option>
        <option value="취소">취소</option>
        <option value="환불">환불</option>
      </select>

      {/* 결제 수단 필터 */}
      <select
        value={paymentFilter}
        onChange={(e) =>
          onPaymentChange(e.target.value as PaymentMethod | "all")
        }
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="all">전체 결제 수단</option>
        <option value="카드">카드</option>
        <option value="계좌이체">계좌이체</option>
        <option value="현금">현금</option>
        <option value="기타">기타</option>
      </select>
    </div>
  );
}
