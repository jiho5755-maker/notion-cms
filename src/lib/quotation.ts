import type { QuotationItem } from "@/types/quotation";
import { calculateVat } from "./price";

/** 견적서 합계 계산 */
export function calculateQuotationTotal(items: QuotationItem[]) {
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const vatAmount = calculateVat(totalAmount);
  const grandTotal = totalAmount + vatAmount;

  return { totalAmount, vatAmount, grandTotal };
}

/** 견적서 ID 생성 (타임스탬프 기반) */
export function generateQuotationId(): string {
  return `Q${Date.now()}`;
}
