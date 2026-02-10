// ============================================================
// PRESSCO 21 — 고객 매출 관리 타입 정의
// "얼마에요" 대체 시스템
// ============================================================

// ------------------------------------------------------------
// 고객 (Customers)
// ------------------------------------------------------------

/** 고객 유형 */
export type CustomerType = "B2C" | "B2B";

/** 고객 등급 */
export type CustomerGrade = "일반" | "VIP" | "VVIP";

/** 고객 기본 정보 */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  /** 회사/단체명 (B2B인 경우) */
  company: string;
  customerType: CustomerType;
  grade: CustomerGrade;
  /** 총 주문 수 */
  totalOrders: number;
  /** 총 구매 금액 (원) */
  totalAmount: number;
  /** 최근 주문일 */
  lastOrderDate: string;
  memo: string;
  /** 연결된 주문 요약 목록 (relation) */
  orders: OrderSummary[];
  createdAt: string;
}

/** 고객 요약 정보 (목록용) */
export type CustomerSummary = Pick<
  Customer,
  | "id"
  | "name"
  | "phone"
  | "email"
  | "customerType"
  | "grade"
  | "totalOrders"
  | "totalAmount"
  | "lastOrderDate"
>;

// ------------------------------------------------------------
// 주문 (Orders)
// ------------------------------------------------------------

/** 결제 수단 */
export type PaymentMethod = "카드" | "계좌이체" | "현금" | "기타";

/** 주문 상태 */
export type OrderStatus =
  | "결제 대기"
  | "결제 완료"
  | "배송 준비"
  | "배송 중"
  | "배송 완료"
  | "취소"
  | "환불";

/** 주문 상품 항목 */
export interface OrderItem {
  name: string;
  quantity: number;
  /** 단가 (원) */
  price: number;
}

/** 주문 상세 정보 */
export interface Order {
  id: string;
  orderNumber: string;
  /** 고객 ID (relation) */
  customerId: string;
  /** 고객 이름 (조회용) */
  customerName?: string;
  orderDate: string;
  /** 주문 상품 목록 (JSON 파싱 필요) */
  items: OrderItem[];
  /** 총 주문 금액 (원) */
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  shippingAddress: string;
  memo: string;
  createdAt: string;
}

/** 주문 요약 정보 (고객 상세용) */
export type OrderSummary = Pick<
  Order,
  | "id"
  | "orderNumber"
  | "orderDate"
  | "totalAmount"
  | "paymentMethod"
  | "status"
>;

// ------------------------------------------------------------
// 필터 및 검색 조건
// ------------------------------------------------------------

/** 고객 필터 */
export interface CustomerFilters {
  /** 고객 유형 필터 */
  customerType?: CustomerType;
  /** 고객 등급 필터 */
  grade?: CustomerGrade;
  /** 검색 키워드 (이름, 전화번호, 이메일, 회사명) */
  search?: string;
}

/** 주문 필터 */
export interface OrderFilters {
  /** 고객 ID */
  customerId?: string;
  /** 주문 상태 필터 */
  status?: OrderStatus;
  /** 결제 수단 필터 */
  paymentMethod?: PaymentMethod;
  /** 시작일 (YYYY-MM-DD) */
  startDate?: string;
  /** 종료일 (YYYY-MM-DD) */
  endDate?: string;
}

// ------------------------------------------------------------
// 매출 통계
// ------------------------------------------------------------

/** 일별 매출 데이터 */
export interface DailySales {
  date: string;
  amount: number;
}

/** 상위 고객 데이터 */
export interface TopCustomer {
  id: string;
  name: string;
  totalAmount: number;
  totalOrders: number;
}

/** 인기 상품 데이터 */
export interface TopProduct {
  name: string;
  totalQuantity: number;
  totalAmount: number;
}

/** 매출 통계 요약 */
export interface SalesStats {
  /** 총 매출 (원) */
  totalRevenue: number;
  /** 총 주문 수 */
  totalOrders: number;
  /** 총 고객 수 */
  totalCustomers: number;
  /** 평균 주문 금액 (원) */
  averageOrderValue: number;
  /** 일별 매출 (최근 30일) */
  dailySales: DailySales[];
  /** 상위 5명 고객 */
  topCustomers: TopCustomer[];
  /** 인기 상품 Top 5 */
  topProducts: TopProduct[];
}

// ------------------------------------------------------------
// 상태 라벨 매핑
// ------------------------------------------------------------

/** 고객 등급 → 색상 클래스 매핑 */
export const CUSTOMER_GRADE_COLORS: Record<CustomerGrade, string> = {
  일반: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  VIP: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  VVIP: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

/** 주문 상태 → 색상 클래스 매핑 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  "결제 대기":
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "결제 완료":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "배송 준비":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "배송 중":
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "배송 완료":
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  취소: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  환불: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
};
