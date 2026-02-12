import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTasks } from "@/lib/work";
import { TaskList } from "../_components/task-list";

export const metadata: Metadata = {
  title: "작업 목록 | 업무 관리",
  description: "3C 매트릭스 기반 작업 관리",
};

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">작업 목록</h1>
          <p className="mt-1 text-gray-600">
            총 {tasks.length}개 작업 · 우선순위 순 정렬
          </p>
        </div>
        <Link href="/work/quick-add">
          <Button size="lg">
            ⚡ 빠른 추가
          </Button>
        </Link>
      </div>

      {/* 작업 목록 */}
      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-12 text-center">
          <p className="text-gray-600">
            아직 작업이 없습니다. 빠른 추가 버튼을 눌러 첫 작업을 만들어보세요!
          </p>
          <Link href="/work/quick-add">
            <Button className="mt-4" size="lg">
              ⚡ 첫 작업 추가하기
            </Button>
          </Link>
        </div>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </div>
  );
}
