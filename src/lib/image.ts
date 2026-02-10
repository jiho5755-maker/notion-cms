// ============================================================
// 이미지 헬퍼 — 노션 이미지 URL 처리 + 폴백
// ============================================================

/** 이미지가 없을 때 표시할 플레이스홀더 */
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

/**
 * 노션 이미지 URL을 프록시 경로로 변환한다.
 * URL이 없거나 빈 문자열이면 플레이스홀더를 반환한다.
 */
export function getNotionImageUrl(url: string | undefined | null): string {
  if (!url || url.trim().length === 0) {
    return PLACEHOLDER_IMAGE;
  }
  return `/api/notion-image?url=${encodeURIComponent(url)}`;
}
