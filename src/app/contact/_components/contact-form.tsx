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
import { Loader2 } from "lucide-react";
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
  "일반 문의",
  "구매 문의",
  "제휴 문의",
  "기술 지원",
];

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(
    null,
  );

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

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("문의 접수에 실패했습니다.");
      }

      // 성공 처리
      setSubmittedData(data);
      setIsSubmitted(true);
      reset();
      toast.success("문의가 접수되었습니다.");
    } catch (error) {
      console.error("문의 제출 에러:", error);
      toast.error("문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
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

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? (
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
