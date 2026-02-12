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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTeamMemberAction } from "@/actions/work";
import type { TeamMemberInput, TeamRole } from "@/types/work";

// Zod 스키마
const teamMemberSchema = z.object({
  title: z.string().min(1, "이름을 입력해주세요").max(100),
  role: z.enum(["웹디자이너", "영상 편집자", "강사"]),
  email: z.string().email("올바른 이메일을 입력해주세요").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface TeamMemberFormProps {
  onSuccess?: () => void;
}

export function TeamMemberForm({ onSuccess }: TeamMemberFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      title: "",
      role: "웹디자이너",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const onSubmit = async (data: TeamMemberFormData) => {
    setIsSubmitting(true);
    try {
      const input: TeamMemberInput = {
        title: data.title,
        role: data.role as TeamRole,
        email: data.email || undefined,
        phone: data.phone || undefined,
        notes: data.notes || undefined,
      };

      const result = await createTeamMemberAction(input);

      if (result.success) {
        toast.success("협업자가 추가되었습니다! 🎉");
        reset();
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(`실패: ${result.error}`);
      }
    } catch (error) {
      toast.error("협업자 추가 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 이름 */}
      <div>
        <Label htmlFor="title">이름 *</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="홍길동"
          className="mt-1"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* 역할 */}
      <div>
        <Label htmlFor="role">역할 *</Label>
        <Select
          value={watch("role")}
          onValueChange={(value) => setValue("role", value as TeamRole)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="웹디자이너">웹디자이너</SelectItem>
            <SelectItem value="영상 편집자">영상 편집자</SelectItem>
            <SelectItem value="강사">강사</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* 이메일 */}
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="email@example.com"
          className="mt-1"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* 연락처 */}
      <div>
        <Label htmlFor="phone">연락처</Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="010-1234-5678"
          className="mt-1"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* 메모 */}
      <div>
        <Label htmlFor="notes">메모</Label>
        <Input
          id="notes"
          {...register("notes")}
          placeholder="추가 정보..."
          className="mt-1"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* 제출 버튼 */}
      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "추가 중..." : "✅ 협업자 추가"}
      </Button>
    </form>
  );
}
