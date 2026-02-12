"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateTaskNotesAction } from "@/actions/work";
import { useRouter } from "next/navigation";

interface TaskNoteEditorProps {
  taskId: string;
  initialNotes?: string;
}

export function TaskNoteEditor({ taskId, initialNotes = "" }: TaskNoteEditorProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateTaskNotesAction(taskId, notes);
      if (result.success) {
        toast.success("노트가 저장되었습니다");
        router.refresh();
      } else {
        toast.error(result.error || "노트 저장에 실패했습니다");
      }
    } catch (error) {
      toast.error("노트 저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="notes">📝 작업 노트 (마크다운 지원)</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="작업 진행 상황, 이슈, 다음 단계 등을 기록하세요..."
        className="min-h-[200px] font-mono text-sm"
      />
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}
