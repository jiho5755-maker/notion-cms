"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MakeshopProduct } from "@/types";

interface ProductSearchProps {
  onSearchResult: (products: MakeshopProduct[], source: string) => void;
  onSearchStart: () => void;
  onSearchEnd?: () => void;
}

/** 상품 검색 컴포넌트 */
export function ProductSearch({
  onSearchResult,
  onSearchStart,
  onSearchEnd,
}: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    onSearchStart();

    try {
      const response = await fetch(
        `/api/makeshop/products?search=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      onSearchResult(data.products || [], data.source || "unknown");
    } catch (error) {
      console.error("상품 검색 실패:", error);
      onSearchResult([], "error");
    } finally {
      setIsSearching(false);
      onSearchEnd?.();
    }
  }, [searchQuery, onSearchResult, onSearchStart]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="상품명으로 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSearching}
        className="flex-1"
      />
      <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
        {isSearching ? "검색 중..." : "검색"}
      </Button>
    </div>
  );
}
