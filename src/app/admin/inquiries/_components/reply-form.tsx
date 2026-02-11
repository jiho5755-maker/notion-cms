// ============================================================
// 답변 작성 폼 컴포넌트
// updateInquiryReply() 호출 + router.refresh()
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { updateInquiryReply } from "@/actions/inquiry";

interface ReplyFormProps {
  inquiryId: string;
}

export function ReplyForm({ inquiryId }: ReplyFormProps) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    if (!reply.trim()) {
      toast.error("답변 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await updateInquiryReply(inquiryId, reply);

      if (success) {
        toast.success("답변이 등록되었습니다.");
        router.refresh(); // Server Component 재렌더링
      } else {
        toast.error("답변 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("답변 등록 오류:", error);
      toast.error("답변 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        답변 작성
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 답변 입력 */}
        <div>
          <label
            htmlFor="reply"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            답변 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reply"
            rows={8}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="고객에게 전달할 답변을 작성해주세요."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white resize-none"
            disabled={isSubmitting}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            답변은 이메일로 고객에게 전송됩니다.
          </p>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !reply.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "등록 중..." : "답변 등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
