import type { Metadata } from "next";
import { getDailyPlanByDate, getTasks } from "@/lib/work";
import { createDailyPlanAction } from "@/actions/work";
import { DailyPlanView } from "../_components/daily-plan-view";
import type { WeekTheme } from "@/types/work";

export const metadata: Metadata = {
  title: "오늘 할 일 | 업무 관리",
  description: "아침 15분 루틴 - Top 3 작업 자동 추천",
};

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * 오늘 요일 테마 반환
 */
function getTodayTheme(): WeekTheme {
  const dayIndex = new Date().getDay();
  const themes: WeekTheme[] = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  return themes[dayIndex];
}

export default async function DailyPage() {
  const today = getTodayString();
  let dailyPlan = await getDailyPlanByDate(today);

  // 일일 계획이 없으면 자동 생성
  if (!dailyPlan) {
    const allTasks = await getTasks();
    const todayTheme = getTodayTheme();

    // 필터: status="진행 전" + dueDate≤오늘
    const eligibleTasks = allTasks.filter(
      (task) =>
        task.status === "진행 전" &&
        new Date(task.dueDate) <= new Date(today),
    );

    if (eligibleTasks.length > 0) {
      // 가중치: weekTheme=오늘이면 +10점
      const scored = eligibleTasks.map((task) => ({
        ...task,
        adjustedScore:
          task.priorityScore + (task.weekTheme === todayTheme ? 10 : 0),
      }));

      // priorityScore 높은 순 정렬 후 상위 3개 선택
      const top3 = scored
        .sort((a, b) => b.adjustedScore - a.adjustedScore)
        .slice(0, 3);

      // Daily Plan 생성
      await createDailyPlanAction({
        date: today,
        theme: todayTheme,
        top3TaskIds: top3.map((t) => t.id),
      });

      // 재조회
      dailyPlan = await getDailyPlanByDate(today);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">오늘 할 일 📅</h1>
        <p className="mt-2 text-gray-600">
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
        {dailyPlan && (
          <p className="mt-1 text-sm text-blue-600">
            오늘의 테마: {dailyPlan.theme}
          </p>
        )}
      </div>

      {/* 일일 계획 뷰 */}
      {dailyPlan ? (
        <DailyPlanView dailyPlan={dailyPlan} />
      ) : (
        <div className="rounded-lg border border-dashed bg-white p-12 text-center">
          <p className="text-gray-600">
            오늘 할 일이 없습니다. 작업 목록에서 작업을 추가해보세요!
          </p>
        </div>
      )}
    </div>
  );
}
