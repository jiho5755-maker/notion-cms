"use client";

// ============================================================
// 고객 테이블 컴포넌트
// 고객 목록을 테이블 형식으로 표시한다.
// ============================================================

import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Customer, CustomerType, CustomerGrade } from "@/types";
import { CUSTOMER_GRADE_COLORS } from "@/types";
import { formatPrice } from "@/lib/price";
import { cn } from "@/lib/utils";

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const [typeFilter, setTypeFilter] = useState<CustomerType | "all">("all");
  const [gradeFilter, setGradeFilter] = useState<CustomerGrade | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 필터링된 고객 목록
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // 타입 필터
      if (typeFilter !== "all" && customer.customerType !== typeFilter) {
        return false;
      }

      // 등급 필터
      if (gradeFilter !== "all" && customer.grade !== gradeFilter) {
        return false;
      }

      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          customer.name.toLowerCase().includes(query) ||
          customer.phone.includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.company.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [customers, typeFilter, gradeFilter, searchQuery]);

  if (customers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          등록된 고객이 없습니다.
        </p>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          노션에서 첫 고객을 추가해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex flex-wrap gap-4">
        {/* 검색 */}
        <input
          type="text"
          placeholder="이름, 전화번호, 이메일, 회사명 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        {/* 타입 필터 */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as CustomerType | "all")}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">전체 타입</option>
          <option value="B2C">B2C</option>
          <option value="B2B">B2B</option>
        </select>

        {/* 등급 필터 */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value as CustomerGrade | "all")}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">전체 등급</option>
          <option value="일반">일반</option>
          <option value="VIP">VIP</option>
          <option value="VVIP">VVIP</option>
        </select>
      </div>

      {/* 결과 수 */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {filteredCustomers.length}명의 고객이 검색되었습니다.
      </p>

      {/* 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  타입
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  등급
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  총 주문
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  총 구매 금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  최근 주문일
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  상세
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </div>
                      {customer.company && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.company}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                        customer.customerType === "B2C"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                      )}
                    >
                      {customer.customerType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                        CUSTOMER_GRADE_COLORS[customer.grade as CustomerGrade],
                      )}
                    >
                      {customer.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {customer.totalOrders}건
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatPrice(customer.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {customer.lastOrderDate
                      ? new Date(customer.lastOrderDate).toLocaleDateString(
                          "ko-KR",
                        )
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link
                      href={`/admin/customers/${customer.id}`}
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
