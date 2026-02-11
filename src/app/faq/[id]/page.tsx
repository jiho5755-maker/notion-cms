import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Calendar } from "lucide-react";
import { getFAQById, getFAQs, incrementFAQViews } from "@/lib/faq";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { FAQ_CATEGORY_COLORS } from "@/types/faq";
// 페이지 파라미터 타입
type FAQPageParams = {
  params: Promise<{ id: string }>;
};

// ISR을 위한 정적 파라미터 생성
export async function generateStaticParams() {
  const faqs = await getFAQs();
  return faqs.map((faq) => ({ id: faq.id }));
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: FAQPageParams): Promise<Metadata> {
  const { id } = await params;
  const faq = await getFAQById(id);

  if (!faq) {
    return {
      title: "FAQ를 찾을 수 없습니다 | PRESSCO 21",
    };
  }

  return {
    title: `${faq.title} | FAQ | PRESSCO 21`,
    description: faq.content.substring(0, 160),
  };
}

export default async function FAQDetailPage({ params }: FAQPageParams) {
  const { id } = await params;
  const faq = await getFAQById(id);

  if (!faq) {
    notFound();
  }

  // 조회수 증가 (비동기, 에러 무시)
  incrementFAQViews(id).catch(() => {});

  const formattedDate = new Date(faq.createdTime).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* 뒤로 가기 */}
        <Link
          href="/faq"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>

        {/* FAQ 헤더 */}
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${FAQ_CATEGORY_COLORS[faq.category]}`}
            >
              {faq.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {faq.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-3xl font-bold">{faq.title}</h1>
        </div>

        {/* FAQ 내용 */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ContentRenderer content={faq.content} />
        </div>

        {/* 추가 도움말 */}
        <div className="mt-12 rounded-lg border bg-muted/50 p-6">
          <h3 className="mb-2 text-lg font-semibold">추가 문의가 필요하신가요?</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            이 답변으로 해결되지 않으셨다면 문의하기를 통해 직접 질문해주세요.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}
