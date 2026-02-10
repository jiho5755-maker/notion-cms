import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  type Difficulty,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from "@/types";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

/** 난이도를 시각적으로 표시하는 배지 컴포넌트 */
export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(DIFFICULTY_COLORS[difficulty], className)}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </Badge>
  );
}
