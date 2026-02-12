import type { Metadata } from "next";
import { getTeamMembers } from "@/lib/work";
import { TeamMemberCard } from "../_components/team-member-card";
import { TeamMemberForm } from "../_components/team-member-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "협업자 관리 | 업무 관리",
  description: "재택 근무자 작업 할당 및 추적",
};

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">협업자 관리 👥</h1>
        <p className="mt-1 text-gray-600">
          총 {members.length}명 · 재택 근무자 작업 할당 및 추적
        </p>
      </div>

      {/* 추가 폼 */}
      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">새 협업자 추가</h2>
        <TeamMemberForm />
      </div>

      {/* 협업자 목록 */}
      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-12 text-center">
          <p className="text-gray-600">
            아직 협업자가 없습니다. 위 폼에서 첫 협업자를 추가해보세요!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
