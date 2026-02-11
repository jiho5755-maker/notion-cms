// ============================================================
// 문의 필터 컴포넌트
// 검색 + 상태/우선순위/카테고리 필터링
// ============================================================

"use client";

import { Search } from "lucide-react";
import type {
  InquiryStatus,
  InquiryPriority,
  InquiryCategory,
} from "@/types/inquiry";

interface InquiryFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: InquiryStatus | "all";
  onStatusChange: (status: InquiryStatus | "all") => void;
  priorityFilter: InquiryPriority | "all";
  onPriorityChange: (priority: InquiryPriority | "all") => void;
  categoryFilter: InquiryCategory | "all";
  onCategoryChange: (category: InquiryCategory | "all") => void;
}

export function InquiryFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
}: InquiryFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* 검색 */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="제목, 고객명, 이메일로 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2">
        {/* 상태 필터 */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as InquiryStatus | "all")}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">모든 상태</option>
          <option value="접수">접수</option>
          <option value="처리중">처리중</option>
          <option value="완료">완료</option>
        </select>

        {/* 우선순위 필터 */}
        <select
          value={priorityFilter}
          onChange={(e) =>
            onPriorityChange(e.target.value as InquiryPriority | "all")
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">모든 우선순위</option>
          <option value="낮음">낮음</option>
          <option value="보통">보통</option>
          <option value="높음">높음</option>
          <option value="긴급">긴급</option>
        </select>

        {/* 카테고리 필터 */}
        <select
          value={categoryFilter}
          onChange={(e) =>
            onCategoryChange(e.target.value as InquiryCategory | "all")
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">모든 카테고리</option>
          <option value="상품 문의">상품 문의</option>
          <option value="주문/배송">주문/배송</option>
          <option value="반품/교환">반품/교환</option>
          <option value="일반 문의">일반 문의</option>
          <option value="제안">제안</option>
          <option value="불만">불만</option>
          <option value="기타">기타</option>
        </select>
      </div>
    </div>
  );
}
