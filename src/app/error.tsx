"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">문제가 발생했습니다</h1>
        <p className="text-muted-foreground">
          페이지를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
