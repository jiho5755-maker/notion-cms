// ============================================================
// 고객 목록 페이지
// 전체 고객 목록을 표시하고 검색/필터 기능을 제공한다.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getCustomers } from "@/lib/customer";
import { CustomerTable } from "./_components/customer-table";
import { CustomerSearch } from "./_components/customer-search";

export const metadata: Metadata = {
  title: "고객 관리 - 관리자",
  description: "고객 목록 조회 및 관리",
};

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            고객 관리
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            총 {customers.length}명의 고객이 등록되어 있습니다.
          </p>
        </div>

        {/* 노션에서 직접 추가 안내 */}
        <Link
          href="https://www.notion.so"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          노션에서 고객 추가
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <CustomerSearch />

      {/* 고객 테이블 */}
      <CustomerTable customers={customers} />
    </div>
  );
}
