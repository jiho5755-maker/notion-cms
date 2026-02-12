import type { Metadata } from "next";
import { QuickAddForm } from "../_components/quick-add-form";

export const metadata: Metadata = {
  title: "빠른 작업 추가 | 업무 관리",
  description: "10초 이내 빠른 작업 입력",
};

export default function QuickAddPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">빠른 작업 추가 ⚡</h1>
        <p className="mt-2 text-gray-600">
          작업명과 마감일만 입력하세요. 나머지는 자동으로 설정됩니다.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <QuickAddForm />
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">💡 자동 설정 항목</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>• 상태: 진행 전</li>
          <li>• 우선순위: 보통</li>
          <li>• 복잡도: 3 / 협업 필요도: 2 / 결과 중요도: 3</li>
          <li>• 요일 테마: 마감일 요일로 자동 설정</li>
        </ul>
      </div>
    </div>
  );
}
