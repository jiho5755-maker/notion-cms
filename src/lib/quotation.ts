import type { QuotationItem } from "@/types/quotation";
import { calculateSupplyPrice } from "./price";

/**
 * 견적서 합계 계산 (역산 방식)
 *
 * 입력 price는 부가세 포함가이므로 역산하여 공급가액과 부가세를 계산
 *
 * @example
 * // 입력: [11000원 × 2개, 5500원 × 1개]
 * // → 공급가: 20000 + 5000 = 25000원
 * // → 부가세: 2000 + 500 = 2500원
 * // → 최종: 27500원 (= 22000 + 5500)
 */
export function calculateQuotationTotal(items: QuotationItem[]) {
  let totalSupplyPrice = 0; // 공급가액 합
  let totalVat = 0; // 부가세 합

  items.forEach((item) => {
    // 1. 단가를 공급가로 역산
    const supplyPrice = calculateSupplyPrice(item.price);

    // 2. 소계 공급가 = 공급가 × 수량
    const subtotalSupplyPrice = supplyPrice * item.quantity;

    // 3. 소계 부가세 = (입력 단가 × 수량) - 소계 공급가
    const subtotalVat = item.subtotal - subtotalSupplyPrice;

    totalSupplyPrice += subtotalSupplyPrice;
    totalVat += subtotalVat;
  });

  return {
    totalAmount: totalSupplyPrice, // 공급가액 합
    vatAmount: totalVat, // 부가세 합
    grandTotal: totalSupplyPrice + totalVat, // 최종 합계 (= 입력 가격 합)
  };
}

/** 견적서 ID 생성 (타임스탬프 기반) */
export function generateQuotationId(): string {
  return `Q${Date.now()}`;
}
