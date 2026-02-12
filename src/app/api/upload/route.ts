import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

// ------------------------------------------------------------
// 설정: 허용 파일 타입 및 크기
// ------------------------------------------------------------

const ALLOWED_MIME_TYPES = [
  // 이미지
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // PDF
  "application/pdf",
  // 비디오 (채널톡처럼)
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/webm",
] as const;

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".mp4",
  ".mov",
  ".avi",
  ".webm",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (비디오 고려)

// ------------------------------------------------------------
// 공개 API: 파일 업로드
// ------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 선택되지 않았습니다." },
        { status: 400 }
      );
    }

    // 1. 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다.`,
        },
        { status: 400 }
      );
    }

    // 2. MIME 타입 검증 (1차)
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
      return NextResponse.json(
        {
          error:
            "허용되지 않는 파일 형식입니다. (이미지, PDF, 비디오만 가능)",
        },
        { status: 400 }
      );
    }

    // 3. 확장자 검증 (2차 - MIME 스푸핑 방지)
    const ext = file.name.toLowerCase().match(/\.\w+$/)?.[0];
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "허용되지 않는 파일 확장자입니다." },
        { status: 400 }
      );
    }

    // 4. Vercel Blob에 업로드
    // pathname: inquiries/2026-02-12/abc123.jpg 형태로 저장
    const timestamp = new Date().toISOString().split("T")[0];
    const randomId = Math.random().toString(36).substring(2, 10);
    const filename = `${randomId}${ext}`;
    const pathname = `inquiries/${timestamp}/${filename}`;

    const blob = await put(pathname, file, {
      access: "public", // 공개 URL 생성
      addRandomSuffix: false, // 이미 randomId 포함
    });

    // 5. 성공 응답
    return NextResponse.json(
      {
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
        contentType: file.type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API /upload] 파일 업로드 에러:", error);
    return NextResponse.json(
      { error: "파일 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
