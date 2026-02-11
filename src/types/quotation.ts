/** 견적서 상품 항목 */
export interface QuotationItem {
  id: string;
  name: string;
  price: number; // 단가 (부가세 포함가)
  quantity: number;
  subtotal: number; // 소계 (= price × quantity, 부가세 포함)
  imageUrl?: string;
}

/** 고객 정보 */
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  message?: string;
}

/** 사업자 정보 */
export interface CompanyInfo {
  name: string; // 상호명
  registrationId: string; // 사업자 번호
  type: string; // 사업자 유형 (개인/법인)
  address: string; // 사업장 주소
  phone: string; // 대표 전화
  email?: string; // 이메일 (선택)
}

/** 견적서 데이터 */
export interface Quotation {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  items: QuotationItem[];
  totalAmount: number; // 공급가액 합 (부가세 제외)
  includeVat: boolean;
  vatAmount: number; // 부가세 합
  grandTotal: number; // 최종 합계 (= totalAmount + vatAmount)
}

/** 이메일 템플릿 타입 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}
