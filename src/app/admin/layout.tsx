// ============================================================
// Admin 레이아웃
// 고객 매출 관리 시스템 공통 레이아웃
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Users, Package, MessageSquare } from "lucide-react";
import { AdminHeader } from "./_components/admin-header";

export const metadata: Metadata = {
  title: "관리자 - PRESSCO 21",
  description: "고객 매출 관리 시스템",
  robots: "noindex,nofollow", // 검색엔진 차단
};

const navigation = [
  { name: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "고객 관리", href: "/admin/customers", icon: Users },
  { name: "주문 관리", href: "/admin/orders", icon: Package },
  { name: "문의 관리", href: "/admin/inquiries", icon: MessageSquare },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                PRESSCO 21 관리자
              </Link>

              {/* 네비게이션 */}
              <nav className="hidden md:flex gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* 홈으로 돌아가기 + 로그아웃 */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                홈으로 돌아가기
              </Link>
              <AdminHeader />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} PRESSCO 21. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
