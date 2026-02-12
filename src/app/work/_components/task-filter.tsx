"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface TaskFilterProps {
  workAreas: string[];
}

export function TaskFilter({ workAreas }: TaskFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [workArea, setWorkArea] = useState(searchParams.get("workArea") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [grade, setGrade] = useState(searchParams.get("grade") || "");

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (workArea) params.set("workArea", workArea);
    else params.delete("workArea");

    if (status) params.set("status", status);
    else params.delete("status");

    if (grade) params.set("grade", grade);
    else params.delete("grade");

    router.push(`?${params.toString()}`);
  };

  const resetFilters = () => {
    setWorkArea("");
    setStatus("");
    setGrade("");
    router.push(window.location.pathname);
  };

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* 업무 영역 */}
        <div>
          <Label>업무 영역</Label>
          <Select value={workArea} onValueChange={setWorkArea}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {workAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 상태 */}
        <div>
          <Label>상태</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              <SelectItem value="진행 전">진행 전</SelectItem>
              <SelectItem value="진행 중">진행 중</SelectItem>
              <SelectItem value="완료">완료</SelectItem>
              <SelectItem value="보류">보류</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 우선순위 등급 */}
        <div>
          <Label>우선순위 등급</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              <SelectItem value="A">A급 (당일 필수)</SelectItem>
              <SelectItem value="B">B급 (주간 목표)</SelectItem>
              <SelectItem value="C">C급 (월간 목표)</SelectItem>
              <SelectItem value="D">D급 (보류/삭제)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 버튼 */}
      <div className="mt-4 flex gap-2">
        <Button onClick={applyFilters}>적용</Button>
        <Button variant="ghost" onClick={resetFilters}>
          초기화
        </Button>
      </div>
    </div>
  );
}
