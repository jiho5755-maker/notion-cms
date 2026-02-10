/** 가격을 한국 원화 형식으로 포맷 (예: 12,000원) */
export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(price)}원`;
}

/** 소계 계산 (단가 × 수량) */
export function calculateSubtotal(price: number, quantity: number): number {
  return price * quantity;
}

/** VAT 10% 계산 (공급가 기준) */
export function calculateVat(amount: number): number {
  return Math.round(amount * 0.1);
}

/**
 * 부가세 포함가에서 공급가액(세전가) 역산
 *
 * @param priceWithVat - 부가세 포함 가격
 * @returns 공급가액 (원 단위 반올림)
 *
 * @example
 * calculateSupplyPrice(11000) // 10000
 * calculateSupplyPrice(12100) // 11000
 */
export function calculateSupplyPrice(priceWithVat: number): number {
  return Math.round(priceWithVat / 1.1);
}

/**
 * 부가세 포함가에서 부가세 역산
 *
 * @param priceWithVat - 부가세 포함 가격
 * @returns 부가세 금액
 */
export function calculateVatFromTotal(priceWithVat: number): number {
  const supplyPrice = calculateSupplyPrice(priceWithVat);
  return priceWithVat - supplyPrice;
}
