/**
 * 고객 문의 타입 정의
 */

export type InquiryCategory = "일반 문의" | "구매 문의" | "제휴 문의" | "기술 지원";
export type InquiryStatus = "접수" | "처리중" | "완료" | "보류";
export type InquiryPriority = "낮음" | "보통" | "높음" | "긴급";

export interface Inquiry {
  id: string;
  title: string;
  name: string;
  email: string;
  phone: string;
  category: InquiryCategory;
  message: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  reply: string | null;
  replyDate: string | null;
  createdTime: string;
}

export interface InquiryFilters {
  status?: InquiryStatus | "all";
  priority?: InquiryPriority | "all";
  category?: InquiryCategory | "all";
  searchQuery?: string;
}

/**
 * 문의 상태별 색상 매핑 (배지 컴포넌트용)
 */
export const INQUIRY_STATUS_COLORS: Record<InquiryStatus, string> = {
  접수: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  처리중: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  완료: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  보류: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
} as const;

/**
 * 문의 우선순위별 색상 매핑 (배지 컴포넌트용)
 */
export const INQUIRY_PRIORITY_COLORS: Record<InquiryPriority, string> = {
  낮음: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  보통: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  높음: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  긴급: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
} as const;

/**
 * 문의 카테고리별 색상 매핑
 */
export const INQUIRY_CATEGORY_COLORS: Record<InquiryCategory, string> = {
  "일반 문의":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "구매 문의":
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "제휴 문의":
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "기술 지원":
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
} as const;
