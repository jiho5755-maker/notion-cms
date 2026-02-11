import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrderById, getCustomerById } from "@/lib/customer";
import { OrderDetailCard } from "../_components/order-detail-card";
import { OrderItemsTable } from "../_components/order-items-table";

// 페이지 파라미터 타입
type OrderPageParams = {
  params: Promise<{ id: string }>;
};

// 메타데이터 생성
export async function generateMetadata({
  params,
}: OrderPageParams): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return {
      title: "주문을 찾을 수 없습니다 | Admin | PRESSCO 21",
    };
  }

  return {
    title: `주문 ${order.orderNumber} | Admin | PRESSCO 21`,
    description: `주문번호 ${order.orderNumber}의 상세 정보입니다.`,
  };
}

export default async function OrderDetailPage({ params }: OrderPageParams) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // 고객 정보 조회
  const customer = order.customerId
    ? await getCustomerById(order.customerId)
    : null;

  return (
    <div className="space-y-8">
      {/* 뒤로 가기 */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        주문 목록으로 돌아가기
      </Link>

      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          주문 상세
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          주문번호: {order.orderNumber}
        </p>
      </div>

      {/* 그리드 레이아웃: 왼쪽 상세 정보, 오른쪽 고객 정보 */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* 주문 상세 정보 (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsTable items={order.items} />
        </div>

        {/* 주문 기본 정보 및 배송지 (1/3) */}
        <div className="lg:col-span-1">
          <OrderDetailCard order={order} customerName={customer?.name} />
        </div>
      </div>

      {/* 고객 정보 카드 (하단) */}
      {customer && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              고객 정보
            </h2>
            <Link
              href={`/admin/customers/${customer.id}`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              고객 상세 보기 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">이름</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {customer.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                전화번호
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {customer.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                이메일
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {customer.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">등급</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {customer.grade}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
