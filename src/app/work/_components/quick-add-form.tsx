"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuickTaskAction } from "@/actions/work";
import type { QuickTaskInput } from "@/types/work";

// Zod 스키마
const quickTaskSchema = z.object({
  title: z.string().min(1, "작업명을 입력하세요").max(100, "작업명은 100자 이내로 입력하세요"),
  dueDate: z.string().min(1, "마감일을 선택하세요"),
});

export function QuickAddForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickTaskInput>({
    resolver: zodResolver(quickTaskSchema),
    defaultValues: {
      title: "",
      dueDate: "",
    },
  });

  const onSubmit = async (data: QuickTaskInput) => {
    setIsSubmitting(true);
    try {
      const result = await createQuickTaskAction(data);

      if (result.success) {
        toast.success("작업이 추가되었습니다!");
        form.reset();
        router.push("/work/tasks");
        router.refresh();
      } else {
        toast.error(`실패: ${result.error}`);
      }
    } catch (error) {
      toast.error("작업 추가 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* 작업명 */}
      <div className="space-y-2">
        <Label htmlFor="title">
          작업명 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="예: 월간 리포트 작성"
          autoFocus
          {...form.register("title")}
          className={form.formState.errors.title ? "border-red-500" : ""}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      {/* 마감일 */}
      <div className="space-y-2">
        <Label htmlFor="dueDate">
          마감일 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="dueDate"
          type="date"
          {...form.register("dueDate")}
          className={form.formState.errors.dueDate ? "border-red-500" : ""}
        />
        {form.formState.errors.dueDate && (
          <p className="text-sm text-red-500">
            {form.formState.errors.dueDate.message}
          </p>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
          size="lg"
        >
          {isSubmitting ? "추가 중..." : "⚡ 작업 추가"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/work/tasks")}
          disabled={isSubmitting}
          size="lg"
        >
          취소
        </Button>
      </div>
    </form>
  );
}
