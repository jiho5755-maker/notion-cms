"use client";

// ============================================================
// Admin 헤더 컴포넌트
// 로그아웃 버튼 포함
// ============================================================

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });

      if (!response.ok) {
        throw new Error("로그아웃 실패");
      }

      toast.success("로그아웃되었습니다.");
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-end border-b bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-950">
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="gap-2"
      >
        <LogOut size={16} />
        로그아웃
      </Button>
    </div>
  );
}
