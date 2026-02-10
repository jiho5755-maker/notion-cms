/** 견적서 상품 항목 */
export interface QuotationItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
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

/** 견적서 데이터 */
export interface Quotation {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  items: QuotationItem[];
  totalAmount: number;
  includeVat: boolean;
  vatAmount: number;
  grandTotal: number;
}
