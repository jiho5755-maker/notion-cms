"use client";

/**
 * FAQ 검색 컴포넌트
 * - 실시간 검색 입력 (debounce 300ms)
 * - Search 아이콘 표시
 */

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FAQSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function FAQSearch({
  onSearch,
  placeholder = "FAQ 검색 (제목, 내용)",
}: FAQSearchProps) {
  const [value, setValue] = useState("");

  // Debounce: 300ms 후 검색 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="검색어 지우기"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
