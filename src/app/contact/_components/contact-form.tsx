"use client";

/**
 * 문의하기 폼 컴포넌트
 * - React Hook Form + Zod 검증
 * - API Route로 노션 DB 저장
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, X, FileIcon, Video } from "lucide-react";
import type { InquiryCategory } from "@/types/inquiry";
import { SuccessMessage } from "./success-message";

// Zod 스키마 정의
const contactSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      "올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)",
    ),
  category: z.enum(["일반 문의", "구매 문의", "제휴 문의", "기술 지원"]),
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이내로 입력해주세요"),
  message: z
    .string()
    .min(10, "문의 내용을 10자 이상 입력해주세요")
    .max(1000, "문의 내용은 1000자 이내로 입력해주세요"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const CATEGORIES: InquiryCategory[] = [
  "상품 문의",
  "주문/배송",
  "반품/교환",
  "일반 문의",
  "제안",
  "불만",
  "기타",
];

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      category: "일반 문의",
      title: "",
      message: "",
    },
  });

  // 파일 검증 공통 함수
  const validateFile = (file: File): boolean => {
    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("파일 크기는 50MB 이하여야 합니다.");
      return false;
    }

    // 파일 타입 검증
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "이미지, PDF, 비디오 파일만 업로드 가능합니다. (jpg, png, gif, webp, pdf, mp4, mov, avi, webm)",
      );
      return false;
    }

    return true;
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  // 파일 제거 핸들러
  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      let attachmentData = null;

      // 1. 파일이 선택된 경우 먼저 업로드
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("파일 업로드에 실패했습니다.");
        }

        const uploadResult = await uploadResponse.json();
        attachmentData = {
          attachmentUrl: uploadResult.url,
          attachmentName: selectedFile.name,
          attachmentSize: selectedFile.size,
        };
        setIsUploading(false);
      }

      // 2. 문의 데이터 전송 (첨부파일 포함)
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...attachmentData,
        }),
      });

      if (!response.ok) {
        throw new Error("문의 접수에 실패했습니다.");
      }

      // 성공 처리
      setSubmittedData(data);
      setIsSubmitted(true);
      setSelectedFile(null);
      reset();
      toast.success("문의가 접수되었습니다.");
    } catch (error) {
      console.error("문의 제출 에러:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
      setIsUploading(false);
    }
  };

  // 성공 메시지 표시 후
  if (isSubmitted && submittedData) {
    return (
      <SuccessMessage
        data={submittedData}
        onReset={() => {
          setIsSubmitted(false);
          setSubmittedData(null);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 이름 */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="홍길동"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* 이메일 */}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          이메일 <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="example@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* 전화번호 */}
      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium">
          전화번호 <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="010-1234-5678"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* 문의 유형 */}
      <div>
        <label htmlFor="category" className="mb-2 block text-sm font-medium">
          문의 유형 <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          {...register("category")}
          className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* 제목 */}
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="문의 제목을 입력해주세요"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* 문의 내용 */}
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          문의 내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          {...register("message")}
          rows={8}
          className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="문의하실 내용을 자세히 작성해주세요"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* 파일 첨부 */}
      <div>
        <label htmlFor="file" className="mb-2 block text-sm font-medium">
          파일 첨부 (선택)
        </label>
        <div className="space-y-2">
          {/* 드래그 앤 드롭 영역 */}
          {!selectedFile && (
            <label
              htmlFor="file"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-sm transition-all ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
              }`}
            >
              <Upload className={`h-5 w-5 ${isDragging ? "animate-bounce" : ""}`} />
              <span className={isDragging ? "font-medium text-primary" : "text-gray-600 dark:text-gray-400"}>
                {isDragging
                  ? "여기에 파일을 놓으세요"
                  : "파일을 드래그하거나 클릭하여 선택 (이미지, PDF, 비디오 / 최대 50MB)"}
              </span>
              <input
                id="file"
                type="file"
                accept="image/*,.pdf,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {/* 선택된 파일 미리보기 */}
          {selectedFile && (
            <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              {selectedFile.type.startsWith("video/") ? (
                <Video className="h-8 w-8 flex-shrink-0 text-purple-500" />
              ) : (
                <FileIcon className="h-8 w-8 flex-shrink-0 text-blue-500" />
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedFile.size > 1024 * 1024
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`
                    : `${(selectedFile.size / 1024).toFixed(1)} KB`}
                  {selectedFile.type.startsWith("video/") && " • 비디오"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleFileRemove}
                className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label="파일 제거"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          이미지 (JPG, PNG, GIF, WebP), PDF, 비디오 (MP4, MOV, AVI, WebM) 파일을 업로드할 수 있습니다.
        </p>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting || isUploading}
        className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            파일 업로드 중...
          </span>
        ) : isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            접수 중...
          </span>
        ) : (
          "문의 접수"
        )}
      </button>
    </form>
  );
}
