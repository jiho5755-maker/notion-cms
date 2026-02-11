// ============================================================
// Admin 로그인 페이지
// 환경 변수 기반 간단한 인증
// ============================================================

import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "관리자 로그인",
  description: "프레스코21 관리자 페이지 로그인",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            관리자 로그인
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            프레스코21 관리자 페이지에 접속하려면 비밀번호를 입력하세요.
          </p>
        </div>

        {/* 로그인 폼 */}
        <Suspense fallback={<div className="text-center">로딩 중...</div>}>
          <LoginForm />
        </Suspense>

        {/* 안내 문구 */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-500">
          <p>
            환경 변수 <code className="rounded bg-gray-200 px-1 py-0.5 dark:bg-gray-800">ADMIN_PASSWORD</code>를 설정하지 않은 경우,
          </p>
          <p className="mt-1">
            기본 비밀번호는 <code className="rounded bg-gray-200 px-1 py-0.5 dark:bg-gray-800">pressco21admin</code> 입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
