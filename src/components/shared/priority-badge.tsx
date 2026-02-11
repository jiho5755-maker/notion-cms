/**
 * 우선순위 배지 컴포넌트
 * - 문의 우선순위 표시에 사용
 */

import { cn } from "@/lib/utils";
import type { InquiryPriority } from "@/types/inquiry";
import { INQUIRY_PRIORITY_COLORS } from "@/types/inquiry";

interface PriorityBadgeProps {
  priority: InquiryPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        INQUIRY_PRIORITY_COLORS[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
