// ============================================================
// PRESSCO 21 — 공통 타입 정의
// 모든 부서가 공유하는 데이터 모델
// ============================================================

// ------------------------------------------------------------
// 난이도 (Difficulty)
// ------------------------------------------------------------

/** 콘텐츠 난이도 레벨 */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/** 난이도 → 한국어 라벨 매핑 */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
};

/** 난이도 → Tailwind CSS 클래스 매핑 (배지용) */
export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  intermediate:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  advanced:
    "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

// ------------------------------------------------------------
// 노션 DB: Categories (카테고리)
// ------------------------------------------------------------

/** 카테고리 — 튜토리얼/재료 분류 체계 */
export interface Category {
  id: string;
  title: string;
  slug: string;
  /** 아이콘 이모지 또는 아이콘 키 */
  icon: string;
  /** 정렬 순서 (낮을수록 먼저 표시) */
  order: number;
}

// ------------------------------------------------------------
// 노션 DB: Materials (재료/상품)
// ------------------------------------------------------------

/** 재료 — 메이크샵 상품과 1:1 대응 */
export interface Material {
  id: string;
  title: string;
  category: string;
  /** 판매가 (원) */
  price: number;
  /** 메이크샵 상품 상세 URL */
  makeshopUrl: string;
  /** 썸네일 이미지 URL 목록 */
  thumbnails: string[];
}

// ------------------------------------------------------------
// 노션 DB: Tutorials (튜토리얼)
// ------------------------------------------------------------

/** 튜토리얼 — 압화 만들기 가이드 콘텐츠 */
export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: Difficulty;
  /** 예상 소요 시간 (예: "30분", "1시간") */
  duration: string;
  /** YouTube 영상 URL */
  youtubeUrl: string;
  /** 커버 이미지 URL */
  coverImage: string;
  /** 요약 설명 */
  excerpt: string;
  published: boolean;
  /** 연결된 재료 목록 (relation) */
  materials: Material[];
  createdAt: string;
}

// ------------------------------------------------------------
// 노션 DB: Combos (재료 조합 가이드)
// ------------------------------------------------------------

/** 재료 조합 — 여러 재료를 묶어 하나의 작품으로 안내 */
export interface Combo {
  id: string;
  title: string;
  difficulty: Difficulty;
  /** 썸네일 이미지 URL 목록 */
  thumbnails: string[];
  /** 요약 설명 */
  excerpt: string;
  published: boolean;
  /** 연결된 재료 목록 (relation) */
  materials: Material[];
  /** 연결된 튜토리얼 요약 목록 (relation) */
  tutorials: Pick<Tutorial, "id" | "title" | "slug">[];
  createdAt: string;
}

// ------------------------------------------------------------
// 노션 DB: Seasons (시즌 캠페인)
// ------------------------------------------------------------

/** 시즌 캠페인 — 기간 한정 프로모션/기획전 */
export interface Season {
  id: string;
  title: string;
  slug: string;
  /** 캠페인 기간 (예: "2026-03-01 ~ 2026-05-31") */
  period: string;
  /** 히어로 이미지 URL */
  heroImage: string;
  /** 요약 설명 */
  excerpt: string;
  published: boolean;
  /** 연결된 튜토리얼 요약 목록 (relation) */
  tutorials: Pick<Tutorial, "id" | "title" | "slug" | "coverImage">[];
  createdAt: string;
}

// ------------------------------------------------------------
// 메이크샵 API 관련 타입
// ------------------------------------------------------------

/** 메이크샵 상품 정보 */
export interface MakeshopProduct {
  productId: string;
  name: string;
  /** 정상가 (원) */
  price: number;
  /** 할인가 (원) */
  salePrice: number;
  imageUrl: string;
  detailUrl: string;
  category: string;
  /** 재고 수량 */
  stock: number;
}

/** 메이크샵 주문 정보 */
export interface MakeshopOrder {
  orderId: string;
  orderDate: string;
  status: string;
  /** 총 주문 금액 (원) */
  totalAmount: number;
  items: MakeshopOrderItem[];
}

/** 메이크샵 주문 상품 항목 */
export interface MakeshopOrderItem {
  productId: string;
  name: string;
  quantity: number;
  /** 단가 (원) */
  price: number;
}

// ------------------------------------------------------------
// 페이지 공통 타입 (Next.js App Router)
// ------------------------------------------------------------

/**
 * 동적 라우트 페이지 props
 * Next.js 15+ 에서 params는 Promise로 감싸져 전달됨
 */
export interface PageParams {
  params: Promise<{ slug: string }>;
}

/**
 * 검색 파라미터가 포함된 페이지 props
 * Next.js 15+ 에서 searchParams는 Promise로 감싸져 전달됨
 */
export interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ------------------------------------------------------------
// SEO / 메타데이터 타입
// ------------------------------------------------------------

/** 사이트 전역 메타데이터 */
export interface SiteMetadata {
  title: string;
  description: string;
  url: string;
  image?: string;
}

/** 브레드크럼 네비게이션 항목 */
export interface BreadcrumbItem {
  name: string;
  href: string;
}
