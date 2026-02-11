// ============================================================
// 문의 테이블 컴포넌트
// 필터링 + 테이블 통합 (order-table 패턴 답습)
// ============================================================

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  Inquiry,
  InquiryStatus,
  InquiryPriority,
  InquiryCategory,
} from "@/types/inquiry";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { InquiryFilter } from "./inquiry-filter";

interface InquiryTableProps {
  inquiries: Inquiry[];
}

export function InquiryTable({ inquiries }: InquiryTableProps) {
  // 필터 state (4개)
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<InquiryPriority | "all">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<InquiryCategory | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // 필터링 (useMemo)
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      // 상태 필터
      if (statusFilter !== "all" && inquiry.status !== statusFilter)
        return false;

      // 우선순위 필터
      if (priorityFilter !== "all" && inquiry.priority !== priorityFilter)
        return false;

      // 카테고리 필터
      if (categoryFilter !== "all" && inquiry.category !== categoryFilter)
        return false;

      // 검색 쿼리
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          inquiry.title.toLowerCase().includes(query) ||
          inquiry.name.toLowerCase().includes(query) ||
          inquiry.email.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [inquiries, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <InquiryFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        총 {filteredInquiries.length}건의 문의
      </div>

      {/* 테이블 */}
      {filteredInquiries.length === 0 ? (
        <EmptyState
          type="search"
          message="문의가 없습니다"
          description="필터 조건을 변경하거나 검색어를 수정해보세요."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    제목
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    고객명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    카테고리
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    상태
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    우선순위
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    생성일
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">상세</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {filteredInquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {/* 제목 */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {inquiry.title}
                    </td>

                    {/* 고객명 */}
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {inquiry.name}
                    </td>

                    {/* 카테고리 */}
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {inquiry.category}
                    </td>

                    {/* 상태 */}
                    <td className="px-6 py-4">
                      <StatusBadge status={inquiry.status} />
                    </td>

                    {/* 우선순위 */}
                    <td className="px-6 py-4">
                      <PriorityBadge priority={inquiry.priority} />
                    </td>

                    {/* 생성일 */}
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(inquiry.createdTime).toLocaleDateString("ko-KR")}
                    </td>

                    {/* 상세 링크 */}
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        상세
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
