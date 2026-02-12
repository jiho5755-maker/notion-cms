"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  updateTaskStatusAction,
  deleteTaskAction,
} from "@/actions/work";
import type { Task, TaskStatus } from "@/types/work";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  WEEK_THEME_LABELS,
  WEEK_THEME_COLORS,
  getPriorityGrade,
  PRIORITY_GRADE_COLORS,
  PRIORITY_GRADE_LABELS,
} from "@/types/work";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "전체">("전체");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // 상태별 필터링
  const filteredTasks =
    selectedStatus === "전체"
      ? tasks
      : tasks.filter((task) => task.status === selectedStatus);

  // 상태 변경 핸들러
  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    setIsUpdating(id);
    try {
      const result = await updateTaskStatusAction(id, newStatus);
      if (result.success) {
        toast.success("작업 상태가 변경되었습니다.");
        router.refresh();
      } else {
        toast.error(`실패: ${result.error}`);
      }
    } catch (error) {
      toast.error("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(null);
    }
  };

  // 작업 삭제 핸들러
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 작업을 삭제하시겠습니까?`)) {
      return;
    }

    setIsUpdating(id);
    try {
      const result = await deleteTaskAction(id);
      if (result.success) {
        toast.success("작업이 삭제되었습니다.");
        router.refresh();
      } else {
        toast.error(`실패: ${result.error}`);
      }
    } catch (error) {
      toast.error("작업 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 상태별 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <StatusTab
          label="전체"
          count={tasks.length}
          selected={selectedStatus === "전체"}
          onClick={() => setSelectedStatus("전체")}
        />
        <StatusTab
          label="진행 전"
          count={tasks.filter((t) => t.status === "진행 전").length}
          selected={selectedStatus === "진행 전"}
          onClick={() => setSelectedStatus("진행 전")}
        />
        <StatusTab
          label="진행 중"
          count={tasks.filter((t) => t.status === "진행 중").length}
          selected={selectedStatus === "진행 중"}
          onClick={() => setSelectedStatus("진행 중")}
        />
        <StatusTab
          label="완료"
          count={tasks.filter((t) => t.status === "완료").length}
          selected={selectedStatus === "완료"}
          onClick={() => setSelectedStatus("완료")}
        />
        <StatusTab
          label="보류"
          count={tasks.filter((t) => t.status === "보류").length}
          selected={selectedStatus === "보류"}
          onClick={() => setSelectedStatus("보류")}
        />
      </div>

      {/* 작업 카드 목록 */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-600">
          {selectedStatus === "전체"
            ? "작업이 없습니다."
            : `"${selectedStatus}" 상태의 작업이 없습니다.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isUpdating={isUpdating === task.id}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 상태 탭 컴포넌트
function StatusTab({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          selected
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// 작업 카드 컴포넌트
function TaskCard({
  task,
  isUpdating,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  isUpdating: boolean;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onDelete: (id: string, title: string) => void;
}) {
  const grade = getPriorityGrade(task.priorityScore);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* 헤더 */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {task.workArea} · 마감일: {new Date(task.dueDate).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <Badge className={`ml-2 border ${PRIORITY_GRADE_COLORS[grade]}`}>
          {grade}급 ({task.priorityScore}점)
        </Badge>
      </div>

      {/* 뱃지 영역 */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className={TASK_STATUS_COLORS[task.status]}>
          {TASK_STATUS_LABELS[task.status]}
        </Badge>
        <Badge className={TASK_PRIORITY_COLORS[task.priority]}>
          {TASK_PRIORITY_LABELS[task.priority]}
        </Badge>
        {task.weekTheme && (
          <Badge className={WEEK_THEME_COLORS[task.weekTheme]}>
            {WEEK_THEME_LABELS[task.weekTheme]}
          </Badge>
        )}
      </div>

      {/* 3C 매트릭스 */}
      <div className="mb-3 flex gap-4 text-sm text-gray-600">
        <span>복잡도: {task.complexity}/5</span>
        <span>협업: {task.collaboration}/5</span>
        <span>중요도: {task.consequence}/5</span>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-wrap gap-2">
        {task.status !== "진행 중" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(task.id, "진행 중")}
            disabled={isUpdating}
          >
            진행 시작
          </Button>
        )}
        {task.status !== "완료" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(task.id, "완료")}
            disabled={isUpdating}
          >
            완료
          </Button>
        )}
        {task.status !== "보류" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(task.id, "보류")}
            disabled={isUpdating}
          >
            보류
          </Button>
        )}
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(task.id, task.title)}
          disabled={isUpdating}
        >
          삭제
        </Button>
      </div>

      {/* 메모 */}
      {task.notes && (
        <div className="mt-3 rounded bg-gray-50 p-2 text-sm text-gray-700">
          {task.notes}
        </div>
      )}
    </div>
  );
}
