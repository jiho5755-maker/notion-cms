/**
 * JSON-LD 구조화 데이터 유틸리티
 *
 * schema.org 표준에 맞는 JSON-LD 객체를 생성한다.
 * 페이지에서 <script type="application/ld+json"> 으로 삽입하여 사용한다.
 *
 * 사용 예시:
 *   const jsonLd = generateOrganizationJsonLd();
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
 *   />
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pressco21.vercel.app";

const SHOP_URL = "https://www.foreverlove.co.kr";

// ── 타입 정의 ──

/** HowTo 스키마에 전달할 튜토리얼 데이터 */
export interface TutorialInput {
  /** 튜토리얼 제목 */
  name: string;
  /** 튜토리얼 설명 */
  description: string;
  /** 대표 이미지 URL */
  image?: string;
  /** 예상 소요 시간 (ISO 8601 Duration, 예: "PT30M") */
  totalTime?: string;
  /** 단계별 설명 */
  steps: {
    /** 단계 제목 */
    name: string;
    /** 단계 설명 */
    text: string;
    /** 단계 이미지 URL */
    image?: string;
  }[];
  /** 필요한 재료 목록 */
  supplies?: {
    name: string;
  }[];
  /** 필요한 도구 목록 */
  tools?: {
    name: string;
  }[];
}

/** Product 스키마에 전달할 상품 데이터 */
export interface ProductInput {
  /** 상품명 */
  name: string;
  /** 상품 설명 */
  description: string;
  /** 상품 이미지 URL 목록 */
  images: string[];
  /** 상품 가격 (원) */
  price: number;
  /** 통화 (기본: KRW) */
  currency?: string;
  /** 재고 상태: InStock, OutOfStock, PreOrder */
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  /** 상품 URL */
  url?: string;
  /** 브랜드명 */
  brand?: string;
  /** SKU */
  sku?: string;
}

/** BreadcrumbList에 전달할 항목 */
export interface BreadcrumbItem {
  /** 표시 이름 */
  name: string;
  /** URL 경로 (SITE_URL 기준 상대 경로 또는 절대 경로) */
  url: string;
}

/** WebPage 스키마에 전달할 페이지 데이터 */
export interface WebPageInput {
  /** 페이지 제목 */
  name: string;
  /** 페이지 설명 */
  description: string;
  /** 페이지 URL (SITE_URL 기준 상대 경로 또는 절대 경로) */
  url: string;
  /** 대표 이미지 URL */
  image?: string;
  /** 마지막 수정일 (ISO 8601) */
  dateModified?: string;
}

// ── JSON-LD 생성 함수 ──

/**
 * Organization 스키마 — 프레스코21 회사 정보
 *
 * 검색엔진에 브랜드 정보를 구조화하여 전달한다.
 */
export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "프레스코21",
    alternateName: "PRESSCO 21",
    url: SHOP_URL,
    description:
      "압화(pressed flower) 전문 — 재료, 도구, 만들기 키트, 교육",
    // TODO: 로고 URL 확정 후 추가
    // logo: `${SHOP_URL}/logo.png`,
    sameAs: [
      // TODO: SNS 계정 URL 추가
      // "https://www.instagram.com/pressco21",
      // "https://blog.naver.com/pressco21",
    ],
  };
}

/**
 * HowTo 스키마 — 튜토리얼 상세 페이지용
 *
 * 구글 검색에서 "방법" 리치 스니펫으로 노출될 수 있다.
 */
export function generateHowToJsonLd(tutorial: TutorialInput) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tutorial.name,
    description: tutorial.description,
    ...(tutorial.image && { image: tutorial.image }),
    ...(tutorial.totalTime && { totalTime: tutorial.totalTime }),
    ...(tutorial.supplies && {
      supply: tutorial.supplies.map((s) => ({
        "@type": "HowToSupply",
        name: s.name,
      })),
    }),
    ...(tutorial.tools && {
      tool: tutorial.tools.map((t) => ({
        "@type": "HowToTool",
        name: t.name,
      })),
    }),
    step: tutorial.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

/**
 * Product 스키마 — 상품 페이지용
 *
 * 구글 검색에서 상품 리치 스니펫(가격, 재고 등)으로 노출될 수 있다.
 */
export function generateProductJsonLd(product: ProductInput) {
  const availabilityMap = {
    InStock: "https://schema.org/InStock",
    OutOfStock: "https://schema.org/OutOfStock",
    PreOrder: "https://schema.org/PreOrder",
  } as const;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    ...(product.brand && {
      brand: {
        "@type": "Brand",
        name: product.brand,
      },
    }),
    ...(product.sku && { sku: product.sku }),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "KRW",
      availability: availabilityMap[product.availability || "InStock"],
      ...(product.url && { url: product.url }),
    },
  };
}

/**
 * BreadcrumbList 스키마 — 경로 탐색 표시용
 *
 * 구글 검색에서 브레드크럼 리치 스니펫으로 노출된다.
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * WebPage 스키마 — 일반 페이지용
 *
 * 페이지의 기본 구조화 데이터를 검색엔진에 전달한다.
 */
export function generateWebPageJsonLd(page: WebPageInput) {
  const pageUrl = page.url.startsWith("http")
    ? page.url
    : `${SITE_URL}${page.url}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url: pageUrl,
    ...(page.image && { image: page.image }),
    ...(page.dateModified && { dateModified: page.dateModified }),
    isPartOf: {
      "@type": "WebSite",
      name: "PRESSCO 21",
      url: SITE_URL,
    },
  };
}
