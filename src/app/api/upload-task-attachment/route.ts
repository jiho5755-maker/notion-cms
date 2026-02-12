// ============================================================
// 작업 첨부파일 업로드 API (Vercel Blob)
// ============================================================

import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const FORBIDDEN_EXTENSIONS = [".exe", ".sh", ".bat", ".cmd", ".com", ".scr"];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload-task-attachment
 *
 * 작업 첨부파일을 Vercel Blob에 업로드한다.
 *
 * Body: FormData
 *   - file: File
 *   - taskId: string
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const taskId = formData.get("taskId") as string | null;

    // 1. 입력 검증
    if (!file) {
      return NextResponse.json(
        { error: "파일이 제공되지 않았습니다." },
        { status: 400 },
      );
    }

    if (!taskId) {
      return NextResponse.json(
        { error: "작업 ID가 제공되지 않았습니다." },
        { status: 400 },
      );
    }

    // 2. 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `파일 크기는 5MB를 초과할 수 없습니다. (현재: ${Math.round(file.size / 1024 / 1024)}MB)` },
        { status: 400 },
      );
    }

    // 3. MIME 타입 검증
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `지원하지 않는 파일 형식입니다: ${file.type}` },
        { status: 400 },
      );
    }

    // 4. 확장자 검증 (보안)
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext && FORBIDDEN_EXTENSIONS.includes(`.${ext}`)) {
      return NextResponse.json(
        { error: "실행 파일은 업로드할 수 없습니다." },
        { status: 400 },
      );
    }

    // 5. 파일명 안전화 (경로 traversal 방지)
    const safeName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, "_");

    // 6. 경로 생성: tasks/YYYY-MM-DD/taskId/randomId.ext
    const today = new Date().toISOString().split("T")[0];
    const randomId = Math.random().toString(36).substring(2, 15);
    const path = `tasks/${today}/${taskId}/${randomId}-${safeName}`;

    // 7. Vercel Blob 업로드
    const blob = await put(path, file, {
      access: "public",
    });

    // 8. 응답
    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] upload-task-attachment 에러:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "파일 업로드에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
