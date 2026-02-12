"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addTaskAttachmentAction, removeTaskAttachmentAction } from "@/actions/work";
import { useRouter } from "next/navigation";
import { TaskAttachment } from "@/types/work";
import { Paperclip, Download, Trash2 } from "lucide-react";

interface TaskAttachmentUploadProps {
  taskId: string;
  attachments?: TaskAttachment[];
}

export function TaskAttachmentUpload({
  taskId,
  attachments = [],
}: TaskAttachmentUploadProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 크기 검증
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB를 초과할 수 없습니다");
      return;
    }

    setIsUploading(true);
    try {
      // 1. 파일 업로드
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", taskId);

      const uploadRes = await fetch("/api/upload-task-attachment", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "파일 업로드 실패");
      }

      const uploadData = await uploadRes.json();

      // 2. Notion DB 업데이트
      const result = await addTaskAttachmentAction(taskId, {
        url: uploadData.url,
        name: uploadData.name,
        size: uploadData.size,
        uploadedAt: uploadData.uploadedAt,
      });

      if (result.success) {
        toast.success("파일이 업로드되었습니다");
        router.refresh();
      } else {
        toast.error(result.error || "첨부파일 추가에 실패했습니다");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "파일 업로드에 실패했습니다");
    } finally {
      setIsUploading(false);
      // Input 초기화
      e.target.value = "";
    }
  };

  const handleDelete = async (url: string, name: string) => {
    if (!confirm(`"${name}" 파일을 삭제하시겠습니까?`)) return;

    try {
      const result = await removeTaskAttachmentAction(taskId, url);
      if (result.success) {
        toast.success("첨부파일이 삭제되었습니다");
        router.refresh();
      } else {
        toast.error(result.error || "첨부파일 삭제에 실패했습니다");
      }
    } catch (error) {
      toast.error("첨부파일 삭제에 실패했습니다");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <Label>📎 첨부파일</Label>

      {/* 첨부파일 목록 */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.url}
              className="flex items-center justify-between rounded-lg border bg-white p-3"
            >
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-gray-400" />
                <div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {attachment.name}
                  </a>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                >
                  <a
                    href={attachment.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(attachment.url, attachment.name)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {attachments.length === 0 && (
        <p className="text-sm text-gray-500">첨부된 파일이 없습니다</p>
      )}

      {/* 파일 선택 */}
      <div>
        <input
          type="file"
          id={`file-upload-${taskId}`}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          asChild
          variant="outline"
          disabled={isUploading}
        >
          <label htmlFor={`file-upload-${taskId}`} className="cursor-pointer">
            <Paperclip className="mr-2 h-4 w-4" />
            {isUploading ? "업로드 중..." : "파일 선택"}
          </label>
        </Button>
        <p className="mt-1 text-xs text-gray-500">
          최대 5MB (이미지, PDF, 문서 파일)
        </p>
      </div>
    </div>
  );
}
