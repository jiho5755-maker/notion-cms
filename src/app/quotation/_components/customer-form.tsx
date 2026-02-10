"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CustomerInfo } from "@/types";

/** 고객 정보 폼 검증 스키마 */
const customerSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      "올바른 전화번호를 입력해주세요. (예: 010-1234-5678)"
    ),
  address: z.string().optional(),
  message: z.string().optional(),
});

interface CustomerFormProps {
  form: ReturnType<typeof useForm<CustomerInfo>>;
}

/** 고객 정보 폼 컴포넌트 */
export function CustomerForm({ form }: CustomerFormProps) {
  return (
    <Form {...form}>
      <div className="space-y-4">
        {/* 이름 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름 *</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이메일 */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일 *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 전화번호 */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>전화번호 *</FormLabel>
              <FormControl>
                <Input placeholder="010-1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 주소 (선택) */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주소 (선택)</FormLabel>
              <FormControl>
                <Input placeholder="서울시 강남구..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 메시지 (선택) */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>문의사항 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="추가 문의사항이 있으시면 입력해주세요."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

/** Zod 스키마를 외부에서도 사용할 수 있도록 export */
export { customerSchema };
