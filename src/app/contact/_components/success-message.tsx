/**
 * 문의 제출 성공 메시지 컴포넌트
 */

import { CheckCircle2 } from "lucide-react";

interface SuccessMessageProps {
  data: {
    name: string;
    email: string;
    category: string;
    title: string;
  };
  onReset: () => void;
}

export function SuccessMessage({ data, onReset }: SuccessMessageProps) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-bold">문의가 접수되었습니다</h2>
      <p className="mb-6 text-muted-foreground">
        빠른 시일 내에 답변 드리겠습니다.
      </p>

      <div className="mb-6 rounded-lg bg-muted p-4 text-left text-sm">
        <div className="mb-2 flex justify-between">
          <span className="font-medium">이름:</span>
          <span>{data.name}</span>
        </div>
        <div className="mb-2 flex justify-between">
          <span className="font-medium">이메일:</span>
          <span>{data.email}</span>
        </div>
        <div className="mb-2 flex justify-between">
          <span className="font-medium">문의 유형:</span>
          <span>{data.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">제목:</span>
          <span className="text-right">{data.title}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onReset}
          className="w-full rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          추가 문의하기
        </button>
        <a
          href="/"
          className="block w-full rounded-md border px-6 py-2 text-sm font-medium hover:bg-muted"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}
