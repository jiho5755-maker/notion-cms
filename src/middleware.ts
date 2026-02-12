// ============================================================
// Next.js Middleware
// Admin 페이지 접근 권한 체크
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 및 /work 경로 보호 (로그인 페이지는 제외)
  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isWorkPath = pathname.startsWith("/work");

  if (isAdminPath || isWorkPath) {
    const token = request.cookies.get("admin-auth")?.value;

    // 토큰이 없거나 유효하지 않으면 로그인 페이지로 리다이렉트
    if (!token || !verifyAuthToken(token)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/work/:path*",
  ],
};
