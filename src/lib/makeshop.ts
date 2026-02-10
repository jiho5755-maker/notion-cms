// ============================================================
// PRESSCO 21 — 메이크샵 Open API 클라이언트
// 메이크샵 상품 데이터를 조회하는 서버 사이드 유틸리티.
// 시간당 조회 500회 제한이 있으므로 Next.js 캐시를 적극 활용한다.
// ============================================================

import type { MakeshopProduct } from "@/types";

// ------------------------------------------------------------
// 환경 변수
// ------------------------------------------------------------

const MAKESHOP_API_BASE = process.env.MAKESHOP_API_URL;
const MAKESHOP_API_KEY = process.env.MAKESHOP_API_KEY;
const MAKESHOP_SHOP_ID = process.env.MAKESHOP_SHOP_ID;

// ------------------------------------------------------------
// 내부 헬퍼
// ------------------------------------------------------------

/**
 * 메이크샵 API 설정이 올바른지 확인한다.
 * 서버 시작 시 환경 변수 누락을 빠르게 감지하기 위함.
 */
function assertConfig(): void {
  if (!MAKESHOP_API_BASE) {
    throw new Error(
      "[메이크샵] MAKESHOP_API_URL 환경 변수가 설정되지 않았습니다.",
    );
  }
  if (!MAKESHOP_API_KEY) {
    throw new Error(
      "[메이크샵] MAKESHOP_API_KEY 환경 변수가 설정되지 않았습니다. " +
        "관리자 어드민 > 오픈 API 메뉴에서 API 키를 확인하세요.",
    );
  }
  if (!MAKESHOP_SHOP_ID) {
    throw new Error(
      "[메이크샵] MAKESHOP_SHOP_ID 환경 변수가 설정되지 않았습니다.",
    );
  }
}

/**
 * 메이크샵 API에 GET 요청을 보낸다.
 * Next.js의 확장된 fetch 옵션으로 ISR 캐싱을 적용한다.
 */
async function makeshopFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  assertConfig();

  const url = new URL(endpoint, MAKESHOP_API_BASE!);

  // 공통 파라미터 추가
  url.searchParams.set("key", MAKESHOP_API_KEY!);
  url.searchParams.set("shopid", MAKESHOP_SHOP_ID!);

  // 추가 쿼리 파라미터
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    // Next.js ISR: 1시간 캐싱 (API 호출 횟수 절약)
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `[메이크샵] API 요청 실패 [${response.status} ${response.statusText}]: ${errorText}`,
    );
  }

  return response.json() as Promise<T>;
}

// ------------------------------------------------------------
// 공개 API 함수
// ------------------------------------------------------------

/**
 * 메이크샵 상품 목록을 조회한다.
 * 카테고리 필터 선택 가능.
 *
 * @param category - 카테고리 코드 (선택)
 * @returns 상품 목록 배열
 */
export async function getMakeshopProducts(
  category?: string,
): Promise<MakeshopProduct[]> {
  try {
    const params: Record<string, string> = {};
    if (category) {
      params.category = category;
    }

    // 메이크샵 Open API 상품 목록 엔드포인트
    const data = await makeshopFetch<{ products?: MakeshopProduct[] }>(
      "/api/v1/products",
      params,
    );

    return data.products ?? [];
  } catch (error) {
    console.error("[메이크샵] 상품 목록 조회 실패:", error);
    return [];
  }
}

/**
 * 메이크샵 상품 상세 정보를 조회한다.
 *
 * @param productId - 상품 ID
 * @returns 상품 정보 또는 null
 */
export async function getMakeshopProduct(
  productId: string,
): Promise<MakeshopProduct | null> {
  try {
    const data = await makeshopFetch<{ product?: MakeshopProduct }>(
      `/api/v1/products/${productId}`,
    );

    return data.product ?? null;
  } catch (error) {
    console.error(
      `[메이크샵] 상품 상세 조회 실패 (ID: ${productId}):`,
      error,
    );
    return null;
  }
}
