// ============================================================
// 업무 통계 집계 함수
// Tasks 데이터를 기반으로 각종 통계를 계산한다
// ============================================================

import type { Task, WorkAreaStats } from "@/types/work";

// ------------------------------------------------------------
// 주간 통계 계산
// ------------------------------------------------------------

/**
 * 특정 기간의 작업 통계를 계산한다.
 */
export function calculateWeeklyStats(
  tasks: Task[],
  weekStart: Date,
  weekEnd: Date,
) {
  // 기간 내 작업 필터링
  const weekTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= weekStart && dueDate <= weekEnd;
  });

  const totalTasks = weekTasks.length;
  const completedTasks = weekTasks.filter((t) => t.status === "완료").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 실제 소요 시간 합계
  const totalTime = weekTasks.reduce(
    (sum, t) => sum + (t.actualTime || 0),
    0,
  );

  return {
    totalTasks,
    completedTasks,
    completionRate,
    totalTime,
  };
}

/**
 * 업무 영역별 통계를 계산한다.
 */
export function getWorkAreaBreakdown(
  tasks: Task[],
  weekStart: Date,
  weekEnd: Date,
): WorkAreaStats[] {
  // 기간 내 작업 필터링
  const weekTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= weekStart && dueDate <= weekEnd;
  });

  // 업무 영역별 그룹화
  const areaMap = new Map<string, Task[]>();
  weekTasks.forEach((task) => {
    const area = task.workArea;
    if (!areaMap.has(area)) {
      areaMap.set(area, []);
    }
    areaMap.get(area)!.push(task);
  });

  // 통계 계산
  const stats: WorkAreaStats[] = [];
  areaMap.forEach((tasks, workArea) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "완료").length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalTime = tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0);

    stats.push({
      workArea,
      totalTasks,
      completedTasks,
      completionRate,
      totalTime,
    });
  });

  // 작업 수 많은 순 정렬
  return stats.sort((a, b) => b.totalTasks - a.totalTasks);
}

/**
 * 주요 성과 자동 추출
 */
export function extractTopAchievements(
  tasks: Task[],
  weekStart: Date,
  weekEnd: Date,
): string {
  const completedTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return (
      dueDate >= weekStart && dueDate <= weekEnd && task.status === "완료"
    );
  });

  if (completedTasks.length === 0) {
    return "이번 주 완료된 작업이 없습니다.";
  }

  // 우선순위 점수 높은 순 상위 5개
  const topTasks = completedTasks
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  return topTasks
    .map((task, index) => `${index + 1}. ${task.title} (${task.workArea})`)
    .join("\n");
}

/**
 * 업무 영역별 분포를 텍스트로 변환
 */
export function formatWorkAreaBreakdown(stats: WorkAreaStats[]): string {
  if (stats.length === 0) {
    return "업무 영역별 통계가 없습니다.";
  }

  return stats
    .map((s) => {
      const timeStr = s.totalTime > 0 ? ` (${s.totalTime}분)` : "";
      return `- ${s.workArea}: ${s.completedTasks}/${s.totalTasks} 완료 (${s.completionRate}%)${timeStr}`;
    })
    .join("\n");
}

// ------------------------------------------------------------
// 날짜 헬퍼
// ------------------------------------------------------------

/**
 * 특정 날짜가 속한 주의 시작일(월요일)과 종료일(일요일)을 반환한다.
 */
export function getWeekRange(date: Date): { weekStart: Date; weekEnd: Date } {
  const current = new Date(date);
  const dayOfWeek = current.getDay(); // 0=일요일, 1=월요일...

  // 월요일을 주 시작으로 설정
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(current);
  weekStart.setDate(current.getDate() + daysToMonday);
  weekStart.setHours(0, 0, 0, 0);

  // 일요일을 주 종료로 설정
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * 주 번호 계산 (ISO 8601)
 */
export function getWeekNumber(date: Date): number {
  const target = new Date(date);
  const dayNum = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNum + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
