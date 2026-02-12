"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createWeeklyReviewAction } from "@/actions/work";
import {
  calculateWeeklyStats,
  getWorkAreaBreakdown,
  extractTopAchievements,
  formatWorkAreaBreakdown,
  getWeekRange,
  formatDate,
} from "@/lib/work-stats";
import type { Task } from "@/types/work";

interface CreateWeeklyReviewButtonProps {
  tasks: Task[];
}

export function CreateWeeklyReviewButton({
  tasks,
}: CreateWeeklyReviewButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // 지난 주 범위 계산
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      const { weekStart, weekEnd } = getWeekRange(lastWeek);

      // 통계 계산
      const stats = calculateWeeklyStats(tasks, weekStart, weekEnd);
      const areaStats = getWorkAreaBreakdown(tasks, weekStart, weekEnd);
      const achievements = extractTopAchievements(tasks, weekStart, weekEnd);
      const breakdown = formatWorkAreaBreakdown(areaStats);

      // Weekly Review 생성
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
        toast.success("주간 리뷰가 생성되었습니다! 🎉");
        router.refresh();
      } else {
        toast.error(`실패: ${result.error}`);
      }
    } catch (error) {
      toast.error("주간 리뷰 생성 중 오류가 발생했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button onClick={handleCreate} disabled={isCreating} size="lg">
      {isCreating ? "생성 중..." : "➕ 지난 주 리뷰 생성"}
    </Button>
  );
}
