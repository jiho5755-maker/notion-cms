import type { Metadata } from "next";
import { getTasks } from "@/lib/work";
import { Badge } from "@/components/ui/badge";
import {
  getPriorityGrade,
  PRIORITY_GRADE_COLORS,
  PRIORITY_GRADE_LABELS,
} from "@/types/work";

export const metadata: Metadata = {
  title: "대시보드 | 업무 관리",
  description: "KPI 통계 및 시각화",
};

export default async function DashboardPage() {
  const tasks = await getTasks();

  // 오늘 날짜
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘 마감 작업
  const todayTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const todayCompleted = todayTasks.filter((t) => t.status === "완료").length;
  const todayCompletionRate =
    todayTasks.length > 0
      ? Math.round((todayCompleted / todayTasks.length) * 100)
      : 0;

  // 전체 통계
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "완료").length;
  const inProgressTasks = tasks.filter((t) => t.status === "진행 중").length;
  const pendingTasks = tasks.filter((t) => t.status === "진행 전").length;

  // 우선순위 등급별 분포
  const gradeA = tasks.filter((t) => getPriorityGrade(t.priorityScore) === "A");
  const gradeB = tasks.filter((t) => getPriorityGrade(t.priorityScore) === "B");
  const gradeC = tasks.filter((t) => getPriorityGrade(t.priorityScore) === "C");
  const gradeD = tasks.filter((t) => getPriorityGrade(t.priorityScore) === "D");

  // 업무 영역별 통계
  const workAreaMap = new Map<string, { total: number; completed: number }>();
  tasks.forEach((task) => {
    const area = task.workArea;
    if (!workAreaMap.has(area)) {
      workAreaMap.set(area, { total: 0, completed: 0 });
    }
    const stats = workAreaMap.get(area)!;
    stats.total++;
    if (task.status === "완료") {
      stats.completed++;
    }
  });

  const topAreas = Array.from(workAreaMap.entries())
    .map(([area, stats]) => ({
      area,
      total: stats.total,
      completed: stats.completed,
      rate: Math.round((stats.completed / stats.total) * 100),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">대시보드 📊</h1>
        <p className="mt-1 text-gray-600">업무 관리 시스템 KPI 통계</p>
      </div>

      {/* 오늘 할 일 KPI */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold">오늘 할 일</h2>
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-medium">완료율</span>
            <Badge
              className={
                todayCompletionRate >= 80
                  ? "bg-green-100 text-green-700"
                  : todayCompletionRate >= 60
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
              }
            >
              {todayCompletionRate}%
            </Badge>
          </div>
          <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${todayCompletionRate}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {todayCompleted}/{todayTasks.length} 작업 완료
          </p>
        </div>
      </div>

      {/* 전체 통계 KPI 카드 */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold">전체 통계</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="총 작업"
            value={totalTasks}
            color="bg-blue-600"
            icon="📋"
          />
          <KpiCard
            label="완료"
            value={completedTasks}
            color="bg-green-600"
            icon="✅"
          />
          <KpiCard
            label="진행 중"
            value={inProgressTasks}
            color="bg-yellow-600"
            icon="🔄"
          />
          <KpiCard
            label="진행 전"
            value={pendingTasks}
            color="bg-gray-600"
            icon="⏳"
          />
        </div>
      </div>

      {/* 우선순위 등급 분포 */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold">우선순위 등급 분포</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <GradeCard grade="A" count={gradeA.length} total={totalTasks} />
          <GradeCard grade="B" count={gradeB.length} total={totalTasks} />
          <GradeCard grade="C" count={gradeC.length} total={totalTasks} />
          <GradeCard grade="D" count={gradeD.length} total={totalTasks} />
        </div>
      </div>

      {/* 업무 영역별 Top 5 */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold">업무 영역별 Top 5</h2>
        <div className="space-y-3">
          {topAreas.map((area) => (
            <div
              key={area.area}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{area.area}</span>
                <span className="text-sm text-gray-600">
                  {area.completed}/{area.total} 완료 ({area.rate}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${area.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// KPI 카드 컴포넌트
function KpiCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color.replace("bg-", "text-")}`}>
        {value}
      </p>
    </div>
  );
}

// 등급 카드 컴포넌트
function GradeCard({
  grade,
  count,
  total,
}: {
  grade: "A" | "B" | "C" | "D";
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <Badge className={`${PRIORITY_GRADE_COLORS[grade]} border`}>
          {grade}급
        </Badge>
        <span className="text-sm text-gray-600">{percentage}%</span>
      </div>
      <p className="text-3xl font-bold">{count}</p>
      <p className="mt-1 text-xs text-gray-600">
        {PRIORITY_GRADE_LABELS[grade]}
      </p>
    </div>
  );
}
