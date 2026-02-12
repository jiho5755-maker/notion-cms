"use client";

import { useState } from "react";
import { TaskTemplate } from "@/types/work";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createTaskFromTemplateAction,
  deleteTaskTemplateAction,
} from "@/actions/work";
import { useRouter } from "next/navigation";
import { getPriorityGrade, PRIORITY_GRADE_COLORS } from "@/types/work";

interface TemplateCardProps {
  template: TaskTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 우선순위 점수 계산 (priority + impact)
  const priorityScore = (template.priority + template.impact) * 10;
  const grade = getPriorityGrade(priorityScore);

  const handleCreateTask = async () => {
    setIsLoading(true);
    try {
      const result = await createTaskFromTemplateAction(template.id);
      if (result.success) {
        toast.success("작업이 생성되었습니다");
        router.push("/work/tasks");
      } else {
        toast.error(result.error || "작업 생성에 실패했습니다");
      }
    } catch (error) {
      toast.error("작업 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 템플릿을 삭제하시겠습니까?")) return;

    setIsLoading(true);
    try {
      const result = await deleteTaskTemplateAction(template.id);
      if (result.success) {
        toast.success("템플릿이 삭제되었습니다");
        router.refresh();
      } else {
        toast.error(result.error || "템플릿 삭제에 실패했습니다");
      }
    } catch (error) {
      toast.error("템플릿 삭제에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* 헤더 */}
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-bold">{template.title}</h3>
        <Badge className={PRIORITY_GRADE_COLORS[grade]}>{grade}급</Badge>
      </div>

      {/* 메타데이터 */}
      <div className="mb-3 space-y-1 text-sm text-gray-600">
        <div>📂 {template.workArea}</div>
        <div>⏱️ 예상 {template.estimatedTime}시간</div>
        {template.checklist && template.checklist.length > 0 && (
          <div>✅ 체크리스트 {template.checklist.length}개</div>
        )}
      </div>

      {/* 설명 */}
      {template.description && (
        <p className="mb-3 text-sm text-gray-700 line-clamp-2">
          {template.description}
        </p>
      )}

      {/* 버튼 */}
      <div className="flex gap-2">
        <Button
          onClick={handleCreateTask}
          disabled={isLoading}
          className="flex-1"
        >
          작업 생성
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          삭제
        </Button>
      </div>
    </div>
  );
}
