/**
 * 빈 상태 UI 컴포넌트
 * - 검색 결과 없음, 데이터 없음 등의 상태 표시
 */

import { Search, Inbox } from "lucide-react";

interface EmptyStateProps {
  type?: "search" | "data";
  message?: string;
  description?: string;
}

export function EmptyState({
  type = "data",
  message,
  description,
}: EmptyStateProps) {
  const Icon = type === "search" ? Search : Inbox;
  const defaultMessage =
    type === "search" ? "검색 결과가 없습니다" : "데이터가 없습니다";
  const defaultDescription =
    type === "search"
      ? "다른 검색어로 시도해보세요"
      : "아직 등록된 데이터가 없습니다";

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {message || defaultMessage}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {description || defaultDescription}
      </p>
    </div>
  );
}
