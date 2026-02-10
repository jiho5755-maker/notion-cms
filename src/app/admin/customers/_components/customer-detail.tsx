"use client";

// ============================================================
// 고객 정보 카드 컴포넌트
// 고객의 기본 정보를 표시한다.
// ============================================================

import { Mail, Phone, MapPin, Building2, Calendar } from "lucide-react";
import type { Customer, CustomerGrade } from "@/types";
import { CUSTOMER_GRADE_COLORS } from "@/types";
import { formatPrice } from "@/lib/price";
import { cn } from "@/lib/utils";

interface CustomerDetailProps {
  customer: Customer;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        고객 정보
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                전화번호
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {customer.phone}
              </p>
            </div>
          </div>

          {customer.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  이메일
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.email}
                </p>
              </div>
            </div>
          )}

          {customer.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  주소
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.address}
                </p>
              </div>
            </div>
          )}

          {customer.company && (
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  회사/단체명
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.company}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 통계 정보 */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              고객 유형
            </p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                customer.customerType === "B2C"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
              )}
            >
              {customer.customerType}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              고객 등급
            </p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                CUSTOMER_GRADE_COLORS[customer.grade as CustomerGrade],
              )}
            >
              {customer.grade}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              총 주문 수
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {customer.totalOrders}건
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              총 구매 금액
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {formatPrice(customer.totalAmount)}
            </p>
          </div>

          {customer.lastOrderDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  최근 주문일
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(customer.lastOrderDate).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 메모 */}
      {customer.memo && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            메모
          </p>
          <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
            {customer.memo}
          </p>
        </div>
      )}
    </div>
  );
}
