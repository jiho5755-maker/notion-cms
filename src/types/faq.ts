/**
 * FAQ (자주 묻는 질문) 타입 정의
 */

export type FAQCategory = "배송" | "결제" | "교환/환불" | "상품" | "기타";

export interface FAQ {
  id: string;
  title: string;
  category: FAQCategory;
  order: number;
  published: boolean;
  views: number;
  content: string;
  createdTime: string;
}

export interface FAQFilters {
  category?: FAQCategory | "all";
  searchQuery?: string;
}

/**
 * FAQ 카테고리별 색상 매핑 (배지 컴포넌트용)
 */
export const FAQ_CATEGORY_COLORS: Record<FAQCategory, string> = {
  배송: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  결제: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "교환/환불":
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  상품: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  기타: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
} as const;

/**
 * FAQ 카테고리 레이블 (UI 표시용)
 */
export const FAQ_CATEGORY_LABELS: Record<FAQCategory, string> = {
  배송: "배송",
  결제: "결제",
  "교환/환불": "교환/환불",
  상품: "상품",
  기타: "기타",
} as const;
