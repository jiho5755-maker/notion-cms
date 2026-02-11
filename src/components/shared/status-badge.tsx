/**
 * 상태 배지 컴포넌트
 * - 문의 상태, 주문 상태 등에 범용적으로 사용
 */

import { cn } from "@/lib/utils";
import type { InquiryStatus } from "@/types/inquiry";
import { INQUIRY_STATUS_COLORS } from "@/types/inquiry";

interface StatusBadgeProps {
  status: InquiryStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        INQUIRY_STATUS_COLORS[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
