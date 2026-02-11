// ============================================================
// 문의 상세 페이지
// 문의 정보 + 조건부 렌더링 (답변 폼 vs 답변 완료 카드)
// ============================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getInquiryById } from "@/lib/inquiry";
import { getTemplates } from "@/lib/notion";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ReplyForm } from "../_components/reply-form";

interface InquiryPageParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InquiryPageParams) {
  const resolvedParams = await params;
  const inquiry = await getInquiryById(resolvedParams.id);

  if (!inquiry) {
    return {
      title: "문의를 찾을 수 없습니다 - PRESSCO 21",
    };
  }

  return {
    title: `${inquiry.title} - 문의 상세 - PRESSCO 21`,
    description: inquiry.message.slice(0, 100),
  };
}

export default async function InquiryDetailPage({ params }: InquiryPageParams) {
  const resolvedParams = await params;
  const [inquiry, templates] = await Promise.all([
    getInquiryById(resolvedParams.id),
    getTemplates(),
  ]);

  if (!inquiry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          문의 목록으로 돌아가기
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {inquiry.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge status={inquiry.status} />
          <PriorityBadge priority={inquiry.priority} />
        </div>
      </div>

      {/* 문의 정보 카드 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          문의 정보
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 왼쪽: 기본 정보 */}
          <div className="space-y-4">
            {/* 이메일 */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  이메일
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {inquiry.email}
                </p>
              </div>
            </div>

            {/* 전화번호 */}
            {inquiry.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    전화번호
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {inquiry.phone}
                  </p>
                </div>
              </div>
            )}

            {/* 카테고리 */}
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  카테고리
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {inquiry.category}
                </p>
              </div>
            </div>

            {/* 생성일 */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  생성일
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(inquiry.createdTime).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 문의 내용 */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              문의 내용
            </p>
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              {inquiry.message}
            </p>
          </div>
        </div>
      </div>

      {/* 답변 섹션 (조건부 렌더링) */}
      {inquiry.reply ? (
        // 답변 완료 카드
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">
              답변 (완료)
            </h2>
          </div>

          <div className="space-y-3">
            {/* 답변 일시 */}
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Calendar className="h-4 w-4" />
              {inquiry.replyDate
                ? new Date(inquiry.replyDate).toLocaleString("ko-KR")
                : "날짜 정보 없음"}
            </div>

            {/* 답변 내용 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {inquiry.reply}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // 답변 작성 폼
        <div>
          <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">답변 대기 중입니다.</p>
          </div>
          <ReplyForm inquiryId={inquiry.id} templates={templates} />
        </div>
      )}
    </div>
  );
}
