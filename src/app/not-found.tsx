import Link from "next/link";
import { Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <Flower2 className="size-16 text-rose-300" />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-lg text-muted-foreground">
          페이지를 찾을 수 없습니다
        </p>
        <p className="text-sm text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
      </div>
      <Button asChild>
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
