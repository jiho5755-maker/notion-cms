import type { Metadata } from "next";
import { getWeeklyReviews, getTasks } from "@/lib/work";
import { WeeklyReviewCard } from "../_components/weekly-review-card";
import { CreateWeeklyReviewButton } from "../_components/create-weekly-review-button";

export const metadata: Metadata = {
  title: "주간 리뷰 | 업무 관리",
  description: "주간 업무 통계 및 회고",
};

export default async function WeeklyPage() {
  const reviews = await getWeeklyReviews();
  const tasks = await getTasks();

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">주간 리뷰 📊</h1>
          <p className="mt-1 text-gray-600">
            총 {reviews.length}개 · 주간 업무 통계 및 회고
          </p>
        </div>
        <CreateWeeklyReviewButton tasks={tasks} />
      </div>

      {/* 안내 메시지 */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-gray-700">
        <p className="font-semibold">💡 주간 리뷰란?</p>
        <ul className="mt-2 space-y-1">
          <li>
            • 매주 일요일, 지난 주 작업 통계를 자동으로 집계합니다.
          </li>
          <li>• 완료율, 업무 영역별 분포, 주요 성과를 확인할 수 있습니다.</li>
          <li>
            • &quot;지난 주 리뷰 생성&quot; 버튼을 눌러 수동으로 생성할 수도
            있습니다.
          </li>
        </ul>
      </div>

      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-12 text-center">
          <p className="text-gray-600">
            아직 주간 리뷰가 없습니다. 위 버튼을 눌러 첫 리뷰를 생성해보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <WeeklyReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
