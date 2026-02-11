// ============================================================
// 문의 목록 페이지
// ============================================================

import { getInquiries } from "@/lib/inquiry";
import { InquiryTable } from "./_components/inquiry-table";

export const metadata = {
  title: "문의 관리 - PRESSCO 21",
  description: "고객 문의 관리 시스템",
};

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          문의 관리
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          고객 문의를 확인하고 답변을 작성하세요.
        </p>
      </div>

      {/* 테이블 */}
      <InquiryTable inquiries={inquiries} />
    </div>
  );
}
