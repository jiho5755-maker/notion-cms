"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteTeamMemberAction } from "@/actions/work";
import type { TeamMember } from "@/types/work";

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm(`"${member.title}" 협업자를 삭제하시겠습니까?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteTeamMemberAction(member.id);
      if (result.success) {
        toast.success("협업자가 삭제되었습니다.");
        router.refresh();
      } else {
        toast.error(`실패: ${result.error}`);
      }
    } catch (error) {
      toast.error("협업자 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* 헤더 */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold">{member.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className="bg-purple-100 text-purple-700">
              {member.role}
            </Badge>
            <Badge variant="outline">
              진행 중: {member.activeTasksCount}개
            </Badge>
          </div>
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="mb-4 space-y-2 text-sm text-gray-600">
        {member.email && (
          <p>
            📧 <a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a>
          </p>
        )}
        {member.phone && (
          <p>
            📱 <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
          </p>
        )}
      </div>

      {/* 작업 통계 */}
      <div className="mb-4 rounded bg-gray-50 p-3 text-sm">
        <div className="flex justify-between">
          <span>할당된 작업:</span>
          <span className="font-semibold">{member.assignedTaskIds.length}개</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>완료한 작업:</span>
          <span className="font-semibold text-green-600">{member.completedTaskIds.length}개</span>
        </div>
      </div>

      {/* 메모 */}
      {member.notes && (
        <div className="mb-4 rounded bg-blue-50 p-3 text-sm text-gray-700">
          💡 {member.notes}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full"
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </Button>
      </div>
    </div>
  );
}
