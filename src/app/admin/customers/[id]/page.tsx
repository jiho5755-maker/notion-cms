// ============================================================
// 고객 상세 페이지
// 특정 고객의 정보 및 주문 내역을 표시한다.
// ============================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomerById } from "@/lib/customer";
import { CustomerDetail } from "../_components/customer-detail";
import { CustomerOrders } from "../_components/customer-orders";

interface PageParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    return {
      title: "고객을 찾을 수 없습니다",
    };
  }

  return {
    title: `${customer.name} - 고객 관리`,
    description: `${customer.name}님의 정보 및 주문 내역`,
  };
}

export default async function CustomerDetailPage({ params }: PageParams) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* 뒤로 가기 */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        고객 목록으로 돌아가기
      </Link>

      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {customer.name}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          고객 정보 및 주문 내역을 확인하세요.
        </p>
      </div>

      {/* 고객 정보 카드 */}
      <CustomerDetail customer={customer} />

      {/* 주문 내역 */}
      <CustomerOrders orders={customer.orders} />
    </div>
  );
}
