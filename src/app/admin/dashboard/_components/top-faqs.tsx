"use client";

// ============================================================
// 상위 FAQ 컴포넌트
// 조회수 기준 상위 10개 FAQ를 표시한다.
// ============================================================

import Link from "next/link";
import { Eye, TrendingUp } from "lucide-react";
import type { FAQ } from "@/types/faq";

interface TopFAQsProps {
  faqs: FAQ[];
}

export function TopFAQs({ faqs }: TopFAQsProps) {
  if (faqs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            인기 FAQ Top 10
          </h2>
        </div>
        <div className="flex h-48 items-center justify-center text-gray-500 dark:text-gray-400">
          데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          인기 FAQ Top 10
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* 순위 */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {index + 1}
                </span>
              </div>

              {/* FAQ 정보 */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {faq.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {faq.category}
                </p>
              </div>
            </div>

            {/* 조회수 */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <p className="font-semibold text-gray-900 dark:text-white">
                {faq.views.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
