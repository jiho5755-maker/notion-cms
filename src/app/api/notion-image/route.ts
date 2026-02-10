import { NextRequest, NextResponse } from "next/server";

/**
 * 노션 이미지 프록시 API Route
 *
 * 노션에서 제공하는 이미지 URL은 S3 signed URL로,
 * 약 1시간 후 만료된다. 이 프록시를 통해 이미지를 중간에서
 * 전달하고 캐싱하여 만료 문제를 해결한다.
 *
 * 사용법: GET /api/notion-image?url=<인코딩된 이미지 URL>
 */

/** 이미지 요청을 허용할 호스트 목록 */
const ALLOWED_HOSTS = ["amazonaws.com", "notion.so"];

/**
 * 주어진 호스트네임이 허용 목록에 포함되는지 확인한다.
 * 서브도메인까지 포함하여 매칭한다.
 * 예: prod-files-secure.s3.us-west-2.amazonaws.com → amazonaws.com 매칭
 */
function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const imageUrl = searchParams.get("url");

  // URL 파라미터 누락 검사
  if (!imageUrl) {
    return NextResponse.json(
      { error: "url 쿼리 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  // URL 형식 유효성 검사
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json(
      { error: "유효하지 않은 URL 형식입니다." },
      { status: 400 }
    );
  }

  // 허용된 호스트인지 확인 (보안)
  if (!isAllowedHost(parsedUrl.hostname)) {
    return NextResponse.json(
      {
        error: `허용되지 않은 호스트입니다: ${parsedUrl.hostname}`,
      },
      { status: 403 }
    );
  }

  try {
    // 원본 이미지 fetch
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `원본 이미지를 가져오지 못했습니다. (status: ${response.status})`,
        },
        { status: response.status }
      );
    }

    // 원본 응답에서 Content-Type 추출
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";

    // 이미지 바이너리 데이터 읽기
    const imageBuffer = await response.arrayBuffer();

    // 캐싱 헤더와 함께 이미지 전달
    // - max-age=86400: 브라우저 캐시 1일
    // - s-maxage=604800: CDN/공유 캐시 7일
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch (error) {
    console.error("노션 이미지 프록시 에러:", error);
    return NextResponse.json(
      { error: "이미지를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
