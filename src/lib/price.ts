/** 가격을 한국 원화 형식으로 포맷 (예: 12,000원) */
export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(price)}원`;
}

/** 소계 계산 (단가 × 수량) */
export function calculateSubtotal(price: number, quantity: number): number {
  return price * quantity;
}

/** VAT 10% 계산 */
export function calculateVat(amount: number): number {
  return Math.round(amount * 0.1);
}
