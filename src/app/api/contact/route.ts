/**
 * 문의하기 API Route
 * - POST: 새로운 문의를 노션 DB에 저장
 */

import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/inquiry";
import type { InquiryCategory } from "@/types/inquiry";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    const { name, email, phone, category, title, message } = body;

    if (!name || !email || !phone || !category || !title || !message) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 노션 DB에 문의 저장
    const inquiryId = await createInquiry({
      name,
      email,
      phone,
      category: category as InquiryCategory,
      title,
      message,
    });

    if (!inquiryId) {
      return NextResponse.json(
        { error: "문의 접수에 실패했습니다." },
        { status: 500 },
      );
    }

    // TODO: 이메일 발송 (Phase 3에서 구현)
    // await sendInquiryEmail({ name, email, title });

    return NextResponse.json(
      {
        success: true,
        inquiryId,
        message: "문의가 접수되었습니다.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API /contact] 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
