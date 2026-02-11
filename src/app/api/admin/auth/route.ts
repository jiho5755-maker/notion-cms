// ============================================================
// Admin 인증 API
// 로그인/로그아웃 처리
// ============================================================

import { NextResponse } from "next/server";
import { verifyAdminPassword, generateAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, action } = body;

    // 로그아웃
    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete("admin-auth");
      return response;
    }

    // 로그인
    if (!password) {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 검증
    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 인증 토큰 생성 및 쿠키 설정
    const token = generateAuthToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24시간
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "인증 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
