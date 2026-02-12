// ============================================================
// PRESSCO 21 — 전역 상수
// ============================================================

/**
 * 사업자 정보
 * - PDF 견적서 및 이메일 발송에 사용
 * - 공개 정보이므로 환경 변수 대신 상수로 관리
 */
export const COMPANY_INFO = {
  name: "프레스코21",
  registrationId: "215-05-52221",
  type: "개인사업자",
  address: "서울시 송파구 송이로 15길 33 가락2차쌍용상가 201호",
  phone: "02-403-4012",
  email: "pressco5755@naver.com",
  tagline: "꽃으로 노는 모든 방법",
} as const;

/**
 * 사이트 메타데이터
 */
export const SITE_CONFIG = {
  name: "PRESSCO 21",
  description: "압화(pressed flower) 전문 콘텐츠 허브",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://hub.foreverlove.co.kr",
} as const;
