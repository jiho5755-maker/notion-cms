"use client";

import { Badge } from "@/components/ui/badge";
import type { WeeklyReview } from "@/types/work";

interface WeeklyReviewCardProps {
  review: WeeklyReview;
}

export function WeeklyReviewCard({ review }: WeeklyReviewCardProps) {
  const weekStartDate = new Date(review.weekStart);
  const weekEndDate = new Date(review.weekEnd);

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* 헤더 */}
      <div className="mb-4">
        <h3 className="text-xl font-bold">{review.title}</h3>
        <p className="mt-1 text-sm text-gray-600">
          {weekStartDate.toLocaleDateString("ko-KR")} ~{" "}
          {weekEndDate.toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* 완료율 표시 */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">완료율</span>
          <Badge
            className={
              review.completionRate >= 80
                ? "bg-green-100 text-green-700"
                : review.completionRate >= 60
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
            }
          >
            {review.completionRate}%
          </Badge>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-500 ${
              review.completionRate >= 80
                ? "bg-green-600"
                : review.completionRate >= 60
                  ? "bg-blue-600"
                  : "bg-yellow-600"
            }`}
            style={{ width: `${review.completionRate}%` }}
          />
        </div>
      </div>

      {/* 통계 */}
      <div className="mb-4 grid grid-cols-3 gap-4 rounded bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{review.totalTasks}</p>
          <p className="text-xs text-gray-600">총 작업</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {review.completedTasks}
          </p>
          <p className="text-xs text-gray-600">완료</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(review.totalTime / 60)}h
          </p>
          <p className="text-xs text-gray-600">소요 시간</p>
        </div>
      </div>

      {/* 주요 성과 */}
      {review.topAchievements && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold">🏆 주요 성과</h4>
          <div className="whitespace-pre-wrap rounded bg-blue-50 p-3 text-sm text-gray-700">
            {review.topAchievements}
          </div>
        </div>
      )}

      {/* 업무 영역별 분포 */}
      {review.workAreaBreakdown && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold">📊 업무 영역별 분포</h4>
          <div className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm text-gray-700">
            {review.workAreaBreakdown}
          </div>
        </div>
      )}

      {/* 다음 주 목표 */}
      {review.nextWeekGoals && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">🎯 다음 주 목표</h4>
          <div className="whitespace-pre-wrap rounded bg-green-50 p-3 text-sm text-gray-700">
            {review.nextWeekGoals}
          </div>
        </div>
      )}
    </div>
  );
}
