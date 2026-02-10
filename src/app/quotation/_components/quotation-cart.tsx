"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/price";
import { calculateQuotationTotal } from "@/lib/quotation";
import type { QuotationItem } from "@/types";

interface QuotationCartProps {
  items: QuotationItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

/** 장바구니 테이블 컴포넌트 */
export function QuotationCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
}: QuotationCartProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">선택된 상품이 없습니다.</p>
        <p className="text-muted-foreground text-sm mt-2">
          상품을 검색하여 추가해주세요.
        </p>
      </div>
    );
  }

  const { totalAmount, vatAmount, grandTotal } = calculateQuotationTotal(items);

  return (
    <div className="space-y-4">
      {/* 상품 목록 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상품명</TableHead>
              <TableHead className="text-right">단가</TableHead>
              <TableHead className="text-center w-32">수량</TableHead>
              <TableHead className="text-right">소계</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  {formatPrice(item.price)}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    value={item.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10);
                      if (qty >= 1 && qty <= 999) {
                        onUpdateQuantity(item.id, qty);
                      }
                    }}
                    className="text-center"
                  />
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatPrice(item.subtotal)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">삭제</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 합계 */}
      <div className="space-y-2 border rounded-lg p-4 bg-muted/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">공급가액</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">부가세 (10%)</span>
          <span>{formatPrice(vatAmount)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>최종 합계</span>
          <span className="text-primary">{formatPrice(grandTotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          * 공급가액은 부가세를 제외한 금액입니다.
        </p>
      </div>
    </div>
  );
}
