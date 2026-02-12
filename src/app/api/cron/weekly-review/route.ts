// ============================================================
// Vercel Cron — 주간 리뷰 자동 생성
// 매주 일요일 오전 9시에 실행
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getTasks } from "@/lib/work";
import { createWeeklyReviewAction } from "@/actions/work";
import {
  calculateWeeklyStats,
  getWorkAreaBreakdown,
  extractTopAchievements,
  formatWorkAreaBreakdown,
  getWeekRange,
  formatDate,
} from "@/lib/work-stats";

/**
 * GET /api/cron/weekly-review
 *
 * Vercel Cron으로부터 호출되어 지난 주 주간 리뷰를 자동 생성한다.
 *
 * 인증: Authorization 헤더의 Bearer 토큰 검증 (CRON_SECRET)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 인증 확인
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.warn("[Cron] CRON_SECRET 환경 변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.warn("[Cron] 인증 실패: 잘못된 토큰");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // 2. 지난 주 범위 계산
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const { weekStart, weekEnd } = getWeekRange(lastWeek);

    console.log(`[Cron] 주간 리뷰 생성 시작: ${formatDate(weekStart)} ~ ${formatDate(weekEnd)}`);

    // 3. Tasks 데이터 조회
    const tasks = await getTasks();

    // 4. 통계 계산
    const stats = calculateWeeklyStats(tasks, weekStart, weekEnd);
    const areaStats = getWorkAreaBreakdown(tasks, weekStart, weekEnd);
    const achievements = extractTopAchievements(tasks, weekStart, weekEnd);
    const breakdown = formatWorkAreaBreakdown(areaStats);

    // 5. Weekly Review 생성
    const result = await createWeeklyReviewAction({
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks,
      completionRate: stats.completionRate,
      totalTime: stats.totalTime,
      workAreaBreakdown: breakdown,
      topAchievements: achievements,
      nextWeekGoals: "다음 주 목표를 작성해주세요.",
    });

    if (result.success) {
      console.log(`[Cron] 주간 리뷰 생성 성공: ${result.reviewId}`);
      return NextResponse.json({
        success: true,
        reviewId: result.reviewId,
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(weekEnd),
        stats,
      });
    } else {
      console.error(`[Cron] 주간 리뷰 생성 실패: ${result.error}`);
      return NextResponse.json(
        { error: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[Cron] 예상치 못한 오류:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
