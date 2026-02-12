import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTaskById } from "@/lib/work";
import { TaskNoteEditor } from "../../_components/task-note-editor";
import { TaskAttachmentUpload } from "../../_components/task-attachment-upload";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  WEEK_THEME_LABELS,
  WEEK_THEME_COLORS,
  getPriorityGrade,
  PRIORITY_GRADE_COLORS,
} from "@/types/work";
import type { PageParams } from "@/types";

export async function generateMetadata({
  params,
}: PageParams<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    return {
      title: "작업을 찾을 수 없습니다",
    };
  }

  return {
    title: `${task.title} | 작업 상세`,
    description: task.notes || "작업 상세 정보",
  };
}

export default async function TaskDetailPage({
  params,
}: PageParams<{ id: string }>) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  const grade = getPriorityGrade(task.priorityScore);

  return (
    <div className="mx-auto max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link href="/work/tasks">
          <Button variant="ghost" size="sm" className="mb-4">
            ← 목록으로
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="mt-2 text-gray-600">
              {task.workArea} · 마감일:{" "}
              {new Date(task.dueDate).toLocaleDateString("ko-KR")}
            </p>
          </div>
          <Badge className={`ml-4 border ${PRIORITY_GRADE_COLORS[grade]}`}>
            {grade}급 ({task.priorityScore}점)
          </Badge>
        </div>
      </div>

      {/* 뱃지 섹션 */}
      <div className="mb-6 flex flex-wrap gap-2">
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
      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">3C 매트릭스</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600">복잡도 (Complexity)</p>
            <p className="mt-1 text-2xl font-bold">{task.complexity}/5</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">협업 (Collaboration)</p>
            <p className="mt-1 text-2xl font-bold">{task.collaboration}/5</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">중요도 (Consequence)</p>
            <p className="mt-1 text-2xl font-bold">{task.consequence}/5</p>
          </div>
        </div>
      </div>

      {/* 작업 노트 */}
      <div className="mb-8 rounded-lg border bg-white p-6">
        <TaskNoteEditor taskId={task.id} initialNotes={task.notes} />
      </div>

      {/* 첨부파일 */}
      <div className="mb-8 rounded-lg border bg-white p-6">
        <TaskAttachmentUpload
          taskId={task.id}
          attachments={task.attachments}
        />
      </div>

      {/* 작업 정보 */}
      {task.checklist && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-xl font-semibold">체크리스트</h2>
          <div className="whitespace-pre-wrap text-gray-700">
            {task.checklist}
          </div>
        </div>
      )}
    </div>
  );
}
