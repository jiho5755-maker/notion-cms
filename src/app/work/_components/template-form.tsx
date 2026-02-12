"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createTaskTemplateAction } from "@/actions/work";
import { useRouter } from "next/navigation";

const templateSchema = z.object({
  title: z.string().min(1, "템플릿명을 입력하세요").max(100),
  workArea: z.string().min(1, "업무 영역을 선택하세요"),
  estimatedTime: z.number().min(0.5).max(100),
  priority: z.number().min(1).max(10),
  impact: z.number().min(1).max(10),
  description: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  workAreas: string[];
}

export function TemplateForm({ workAreas }: TemplateFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      priority: 5,
      impact: 5,
      estimatedTime: 4,
    },
  });

  const selectedWorkArea = watch("workArea");

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createTaskTemplateAction(data);
      if (result.success) {
        toast.success("템플릿이 생성되었습니다");
        reset();
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "템플릿 생성에 실패했습니다");
      }
    } catch (error) {
      toast.error("템플릿 생성에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>➕ 새 템플릿 추가</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 템플릿 추가</DialogTitle>
          <DialogDescription>
            자주 사용하는 작업 패턴을 템플릿으로 저장하세요
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 템플릿명 */}
          <div>
            <Label htmlFor="title">템플릿명 *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="예: API 개발"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* 업무 영역 */}
          <div>
            <Label htmlFor="workArea">업무 영역 *</Label>
            <Select
              value={selectedWorkArea}
              onValueChange={(value) => setValue("workArea", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {workAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workArea && (
              <p className="mt-1 text-sm text-red-600">
                {errors.workArea.message}
              </p>
            )}
          </div>

          {/* 예상 시간, 우선순위, 영향도 */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="estimatedTime">예상 시간 (시간)</Label>
              <Input
                id="estimatedTime"
                type="number"
                step="0.5"
                {...register("estimatedTime", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="priority">우선순위 (1-10)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                {...register("priority", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="impact">영향도 (1-10)</Label>
              <Input
                id="impact"
                type="number"
                min="1"
                max="10"
                {...register("impact", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <Label htmlFor="description">설명 (선택)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="템플릿 설명"
              rows={3}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
