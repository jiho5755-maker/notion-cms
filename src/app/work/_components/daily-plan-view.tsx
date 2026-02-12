"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateTaskStatusAction } from "@/actions/work";
import type { DailyPlanWithTasks } from "@/types/work";
import {
  TASK_STATUS_COLORS,
  WEEK_THEME_LABELS,
  getPriorityGrade,
  PRIORITY_GRADE_COLORS,
} from "@/types/work";

interface DailyPlanViewProps {
  dailyPlan: DailyPlanWithTasks;
}

export function DailyPlanView({ dailyPlan }: DailyPlanViewProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // 작업 완료 핸들러
  const handleComplete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 작업을 완료하시겠습니까?`)) {
      return;
    }

    setIsUpdating(id);
    try {
      const result = await updateTaskStatusAction(id, "완료");
      if (result.success) {
        toast.success("작업이 완료되었습니다! 🎉");
        router.refresh();
      } else {
        toast.error(`실패: ${result.error}`);
      }
    } catch (error) {
      toast.error("작업 완료 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(null);
    }
  };

  const top3Tasks = dailyPlan.top3Tasks || [];
  const completedCount = top3Tasks.filter((t) => t.status === "완료").length;
  const totalEstimatedTime = top3Tasks.reduce(
    (sum, t) => sum + (t.estimatedTime || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* 진행 상황 */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">진행 상황</h2>
          <Badge variant="outline">
            {completedCount}/{top3Tasks.length} 완료
          </Badge>
        </div>

        {/* 진행률 바 */}
        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${(completedCount / top3Tasks.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-600">
          {completedCount === top3Tasks.length
            ? "🎉 오늘의 핵심 작업을 모두 완료했습니다!"
            : `${top3Tasks.length - completedCount}개의 작업이 남았습니다.`}
        </p>

        {totalEstimatedTime > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            예상 소요 시간: {totalEstimatedTime}분
          </p>
        )}
      </div>

      {/* Top 3 작업 카드 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">오늘의 핵심 작업 Top 3</h2>

        {top3Tasks.map((task, index) => {
          const grade = getPriorityGrade(task.priorityScore);
          const isCompleted = task.status === "완료";

          return (
            <div
              key={task.id}
              className={`rounded-lg border bg-white p-6 shadow-sm transition-all ${
                isCompleted ? "opacity-60" : "hover:shadow-md"
              }`}
            >
              {/* 순서 배지 + 제목 */}
              <div className="mb-3 flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      isCompleted ? "text-gray-500 line-through" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {task.workArea} · 마감일:{" "}
                    {new Date(task.dueDate).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <Badge className={`border ${PRIORITY_GRADE_COLORS[grade]}`}>
                  {grade}급 ({task.priorityScore}점)
                </Badge>
              </div>

              {/* 상태 뱃지 */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge className={TASK_STATUS_COLORS[task.status]}>
                  {task.status}
                </Badge>
                {task.weekTheme && (
                  <Badge variant="outline">
                    {WEEK_THEME_LABELS[task.weekTheme]}
                  </Badge>
                )}
                {task.estimatedTime && (
                  <Badge variant="outline">{task.estimatedTime}분</Badge>
                )}
              </div>

              {/* 3C 매트릭스 */}
              <div className="mb-4 flex gap-4 text-sm text-gray-600">
                <span>복잡도: {task.complexity}/5</span>
                <span>협업: {task.collaboration}/5</span>
                <span>중요도: {task.consequence}/5</span>
              </div>

              {/* 메모 */}
              {task.notes && (
                <div className="mb-4 rounded bg-blue-50 p-3 text-sm text-gray-700">
                  💡 {task.notes}
                </div>
              )}

              {/* 완료 버튼 */}
              {!isCompleted && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => handleComplete(task.id, task.title)}
                  disabled={isUpdating === task.id}
                >
                  {isUpdating === task.id ? "처리 중..." : "✅ 완료 처리"}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* 안내 메시지 */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-semibold">💡 오늘의 작업 선정 기준</p>
        <ul className="mt-2 space-y-1">
          <li>
            • 마감일이 오늘 이하인 &quot;진행 전&quot; 작업 중 우선순위 점수 상위 3개
          </li>
          <li>• 오늘의 요일 테마와 일치하는 작업은 +10점 가산</li>
          <li>
            • 우선순위 점수 = 복잡도×20 + 협업 필요도×20 + 결과 중요도×20
          </li>
        </ul>
      </div>
    </div>
  );
}
