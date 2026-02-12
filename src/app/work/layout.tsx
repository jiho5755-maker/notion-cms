import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: "업무 관리 | PRESSCO 21",
  description: "3C 매트릭스 기반 업무 일정 관리 시스템",
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                업무 관리 시스템
              </h1>
              <p className="text-sm text-gray-600">3C 매트릭스 기반 우선순위 관리</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  관리자 페이지
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <NavLink href="/work/quick-add">⚡ 빠른 추가</NavLink>
            <NavLink href="/work/daily">📅 오늘 할 일</NavLink>
            <NavLink href="/work/tasks">📋 전체 작업</NavLink>
            <NavLink href="/work/team">👥 협업자</NavLink>
            <NavLink href="/work/weekly">📊 주간 리뷰</NavLink>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* 푸터 */}
      <footer className="border-t bg-white py-4 text-center text-sm text-gray-600">
        <p>PRESSCO 21 업무 관리 시스템 v1.0.0</p>
      </footer>
    </div>
  );
}

// 네비게이션 링크 컴포넌트
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-blue-600"
    >
      {children}
    </Link>
  );
}
