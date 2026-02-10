"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QuotationItem } from "@/types/quotation";

interface ManualProductFormProps {
  onAddItem: (item: QuotationItem) => void;
}

/**
 * 상품 직접 입력 폼 컴포넌트
 *
 * 검색 결과가 없거나 커스텀 상품을 추가할 때 사용
 */
export function ManualProductForm({ onAddItem }: ManualProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const priceStr = formData.get("price") as string;
      const quantityStr = formData.get("quantity") as string;

      const price = parseInt(priceStr, 10);
      const quantity = parseInt(quantityStr, 10);

      // 유효성 검증
      if (!name.trim()) {
        toast.error("상품명을 입력해주세요.");
        return;
      }

      if (isNaN(price) || price < 0) {
        toast.error("올바른 단가를 입력해주세요.");
        return;
      }

      if (isNaN(quantity) || quantity < 1) {
        toast.error("수량은 1개 이상이어야 합니다.");
        return;
      }

      // 임시 ID 생성 (타임스탬프 기반)
      const id = `manual-${Date.now()}`;

      const item: QuotationItem = {
        id,
        name: name.trim(),
        price,
        quantity,
        subtotal: price * quantity,
        imageUrl: undefined, // 수동 입력 상품은 이미지 없음
      };

      onAddItem(item);

      // 폼 초기화
      e.currentTarget.reset();

      toast.success("상품이 추가되었습니다.");
    } catch (error) {
      console.error("상품 추가 실패:", error);
      toast.error("상품 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>상품 직접 입력</CardTitle>
        <CardDescription>
          검색 결과가 없거나 커스텀 상품을 추가할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {/* 상품명 입력 */}
            <div className="grid gap-2">
              <Label htmlFor="name">상품명 *</Label>
              <Input
                id="name"
                name="name"
                placeholder="예: 압화 재료 A세트"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* 단가 입력 */}
            <div className="grid gap-2">
              <Label htmlFor="price">단가 (원, 부가세 포함) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step={100}
                placeholder="예: 11000"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                판매 가격을 입력하세요. 견적서에서 자동으로 공급가액과 부가세를
                분리합니다.
              </p>
            </div>

            {/* 수량 입력 */}
            <div className="grid gap-2">
              <Label htmlFor="quantity">수량 *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                max={999}
                defaultValue={1}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* 추가 버튼 */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? "추가 중..." : "장바구니에 추가"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
