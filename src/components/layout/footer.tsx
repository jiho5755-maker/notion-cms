import Link from "next/link";
import { Flower2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/** 콘텐츠 링크 */
const CONTENT_LINKS = [
  { label: "튜토리얼", href: "/tutorials" },
  { label: "재료 조합", href: "/combos" },
  { label: "시즌 캠페인", href: "/seasons" },
] as const;

/** 서비스 링크 */
const SERVICE_LINKS = [
  { label: "B2B 카탈로그", href: "/wholesale" },
  { label: "셀프 견적서", href: "/quotation" },
  {
    label: "쇼핑몰",
    href: "https://www.foreverlove.co.kr",
    external: true,
  },
] as const;

/** 회사 정보 링크 */
const COMPANY_LINKS = [
  { label: "브랜드 소개", href: "/about" },
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
] as const;

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* 상단: 로고 + 링크 그룹 */}
        <div className="grid gap-8 py-12 md:grid-cols-4">
          {/* 로고 & 소개 */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Flower2 className="size-6 text-primary" />
              <span className="text-lg font-bold tracking-tight">
                PRESSCO 21
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              꽃으로 노는 모든 방법.
              <br />
              압화 전문 — 재료, 도구, 키트, 교육.
            </p>
          </div>

          {/* 콘텐츠 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">콘텐츠</h3>
            <ul className="flex flex-col gap-2">
              {CONTENT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">서비스</h3>
            <ul className="flex flex-col gap-2">
              {SERVICE_LINKS.map(({ label, href, ...rest }) => {
                const isExternal = "external" in rest && rest.external;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      {...(isExternal && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                      {isExternal && (
                        <span className="ml-1 text-xs">&#8599;</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">회사 정보</h3>
            <ul className="flex flex-col gap-2">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* 하단: 저작권 */}
        <div className="flex flex-col items-center justify-between gap-2 py-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 프레스코21. 모든 권리 보유.
          </p>
          <Link
            href="https://www.foreverlove.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            www.foreverlove.co.kr &#8599;
          </Link>
        </div>
      </div>
    </footer>
  );
}
