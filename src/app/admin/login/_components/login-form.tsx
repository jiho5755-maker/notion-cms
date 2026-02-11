"use client";

// ============================================================
// 로그인 폼 컴포넌트
// React Hook Form + Zod 검증
// ============================================================

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LockKeyhole } from "lucide-react";

// ============================================================
// 타입 정의
// ============================================================

const loginSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================
// 컴포넌트
// ============================================================

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/admin/dashboard";

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "로그인에 실패했습니다.");
        return;
      }

      toast.success("로그인되었습니다.");
      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 비밀번호 입력 */}
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            {...register("password")}
            className="pl-10"
            disabled={isLoading}
          />
          <LockKeyhole
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* 로그인 버튼 */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
