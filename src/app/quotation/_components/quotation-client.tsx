"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductSearch } from "./product-search";
import { ProductList } from "./product-list";
import { QuotationCart } from "./quotation-cart";
import { CustomerForm, customerSchema } from "./customer-form";
import { calculateSubtotal } from "@/lib/price";
import { generateQuotationId, calculateQuotationTotal } from "@/lib/quotation";
import { generateQuotationPDF } from "@/lib/pdf";
import type { MakeshopProduct, QuotationItem, CustomerInfo, Quotation } from "@/types";

/** 셀프 견적서 메인 클라이언트 컴포넌트 */
export function QuotationClient() {
  // 상태 관리
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [searchResults, setSearchResults] = useState<MakeshopProduct[]>([]);
  const [dataSource, setDataSource] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  // 고객 정보 폼
  const form = useForm<CustomerInfo>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      message: "",
    },
  });

  // 상품 추가 핸들러
  const handleAddItem = (product: MakeshopProduct) => {
    const existingItem = items.find((item) => item.id === product.productId);

    if (existingItem) {
      // 중복 상품 → 수량 증가
      setItems((prev) =>
        prev.map((item) =>
          item.id === product.productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: calculateSubtotal(item.price, item.quantity + 1),
              }
            : item
        )
      );
      toast.success("상품 수량이 증가되었습니다.");
    } else {
      // 신규 상품 추가
      const newItem: QuotationItem = {
        id: product.productId,
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        subtotal: product.salePrice,
        imageUrl: product.imageUrl,
      };
      setItems((prev) => [...prev, newItem]);
      toast.success("상품이 추가되었습니다.");
    }
  };

  // 수량 변경 핸들러
  const handleUpdateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              subtotal: calculateSubtotal(item.price, quantity),
            }
          : item
      )
    );
  };

  // 상품 삭제 핸들러
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("상품이 삭제되었습니다.");
  };

  // PDF 생성 핸들러
  const handleGeneratePDF = async () => {
    // 1. 장바구니 빈 상태 체크
    if (items.length === 0) {
      toast.error("선택된 상품이 없습니다.");
      return;
    }

    // 2. 폼 검증
    const isValid = await form.trigger();

    if (!isValid) {
      toast.error("고객 정보를 올바르게 입력해주세요.");
      return;
    }

    // 3. Quotation 객체 생성
    const formData = form.getValues();
    const quotation: Quotation = {
      id: generateQuotationId(),
      createdAt: new Date().toISOString(),
      customer: formData,
      items,
      ...calculateQuotationTotal(items),
      includeVat: true,
    };

    // 4. PDF 생성 및 다운로드
    const toastId = toast.loading("PDF를 생성하는 중...");

    try {
      const pdfBlob = await generateQuotationPDF(quotation);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `견적서_${quotation.customer.name}_${quotation.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("PDF 다운로드 완료!", { id: toastId });
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      toast.error("PDF 생성에 실패했습니다.", { id: toastId });
    }
  };

  return (
    <div className="space-y-8">
      {/* Fallback 안내 */}
      {dataSource === "notion" && (
        <Alert>
          <AlertDescription>
            현재 노션 데이터를 표시하고 있습니다. 메이크샵 연동은 관리자에게
            문의하세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 상품 검색 섹션 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">상품 검색</h2>
        <ProductSearch
          onSearchResult={(products, source) => {
            setSearchResults(products);
            setDataSource(source);
          }}
          onSearchStart={() => setIsSearching(true)}
          onSearchEnd={() => setIsSearching(false)}
        />
        {searchResults.length > 0 || isSearching ? (
          <ProductList
            products={searchResults}
            onAddItem={handleAddItem}
            isLoading={isSearching}
          />
        ) : null}
      </section>

      <Separator />

      {/* 레이아웃: 데스크톱 2컬럼, 모바일 세로 */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 왼쪽: 장바구니 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">선택된 상품</h2>
          <QuotationCart
            items={items}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </section>

        {/* 오른쪽: 고객 정보 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">고객 정보</h2>
          <div className="border rounded-lg p-6">
            <CustomerForm form={form} />
          </div>
        </section>
      </div>

      {/* PDF 생성 버튼 (하단 고정) */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          size="lg"
          onClick={handleGeneratePDF}
          disabled={items.length === 0}
          className="shadow-lg"
        >
          PDF 견적서 생성
        </Button>
      </div>
    </div>
  );
}
