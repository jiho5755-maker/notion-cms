import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "프레스코21 소개",
  description:
    "꽃으로 노는 모든 방법. 압화 전문 브랜드 프레스코21의 재료, 도구, 키트, 교육 서비스를 소개합니다.",
};

export default function AboutPage() {
  return (
    <section className="container mx-auto px-4 py-12">
      {/* 브레드크럼 */}
      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <li>
            <Link href="/">홈</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">
            소개
          </li>
        </ol>
      </nav>

      {/* 히어로 섹션 */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          꽃으로 노는 모든 방법
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          프레스코21은 압화(pressed flower) 전문 브랜드입니다. 재료, 도구,
          만들기 키트, 교육까지 — 꽃을 사랑하는 모든 분들에게 창작의 즐거움을
          제공합니다.
        </p>
      </div>

      {/* 회사 소개 */}
      <div className="mb-16">
        <h2 className="mb-6 text-3xl font-bold">프레스코21 소개</h2>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed">
            프레스코21(PRESSCO 21)은 압화를 중심으로 레진공예, 드라이&amp;프리저브드
            플라워, 하바리움 등 다양한 플라워 크래프트 분야의 전문 자재와 교육을
            제공하는 브랜드입니다.
          </p>
          <p className="text-lg leading-relaxed">
            개인 취미인(B2C)부터 학교, 복지관, 기업, 강사(B2B)까지 폭넓은 고객층을
            보유하고 있으며, YouTube, Instagram, Class101, 네이버블로그 등 다양한
            채널을 통해 압화의 아름다움과 창작의 즐거움을 전하고 있습니다.
          </p>
        </div>
      </div>

      {/* 제공 서비스 */}
      <div className="mb-16">
        <h2 className="mb-8 text-3xl font-bold">제공 서비스</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>재료 &amp; 도구</CardTitle>
              <CardDescription>
                압화, 레진, 드라이플라워 등 다양한 크래프트 재료
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                엄선된 압화 재료부터 전문 도구까지. 창작에 필요한 모든 것을
                한곳에서 만나보세요.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>만들기 키트</CardTitle>
              <CardDescription>
                초보자도 쉽게 따라 만들 수 있는 올인원 키트
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                재료, 도구, 가이드가 모두 포함된 키트로 언제 어디서나 압화
                만들기를 시작할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>교육 프로그램</CardTitle>
              <CardDescription>
                학교, 복지관, 기업을 위한 맞춤형 교육
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                단체 교육부터 강사 양성 과정까지. 압화를 통해 창의성과 힐링을
                경험하세요.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>튜토리얼 &amp; 가이드</CardTitle>
              <CardDescription>
                단계별 압화 만들기 레시피와 재료 조합 가이드
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                압화 초보자부터 전문가까지. 다양한 난이도의 튜토리얼과 재료 조합
                팁을 무료로 제공합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SNS 링크 */}
      <div className="mb-16">
        <h2 className="mb-8 text-3xl font-bold">소셜 미디어</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" asChild>
            <a
              href="https://www.youtube.com/@pressco21"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://www.instagram.com/pressco21"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://class101.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              Class101
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://blog.naver.com/pressco21"
              target="_blank"
              rel="noopener noreferrer"
            >
              네이버블로그
            </a>
          </Button>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-muted rounded-lg p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">쇼핑몰 방문하기</h2>
        <p className="text-muted-foreground mb-6">
          압화 재료와 키트를 지금 바로 만나보세요
        </p>
        <Button size="lg" asChild>
          <a
            href="https://www.foreverlove.co.kr"
            target="_blank"
            rel="noopener noreferrer"
          >
            쇼핑몰 바로가기
          </a>
        </Button>
      </div>
    </section>
  );
}
