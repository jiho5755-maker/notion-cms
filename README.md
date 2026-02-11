# PRESSCO 21 — 꽃으로 노는 모든 방법

> 압화(pressed flower) 전문 콘텐츠 허브 · Notion CMS + Next.js

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000)](https://vercel.com/)

---

## 프로젝트 개요

PRESSCO 21은 압화 전문 콘텐츠를 제공하는 웹 허브입니다.

- **브랜드**: 프레스코21 (PRESSCO 21)
- **쇼핑몰**: [www.foreverlove.co.kr](https://www.foreverlove.co.kr) (메이크샵)
- **콘텐츠 허브**: [pressco21.vercel.app](https://pressco21.vercel.app) (Next.js)

### 주요 기능

- 튜토리얼 (DIY 압화 만들기 가이드)
- 재료 조합 가이드 (어떤 재료를 함께 쓸지)
- 시즌 캠페인 (봄꽃 축제, 크리스마스 등)
- 셀프 견적서 (PDF 자동 생성)
- 고객 매출 관리 (노션 DB 연동)
- FAQ + 문의 자동화

---

## 시작하기

### 필수 요구사항

- Node.js 20+
- npm 또는 yarn
- Notion 계정 (Notion API Integration 필요)

### 1. 클론 및 설치

```bash
git clone https://github.com/yourusername/notion-cms.git
cd notion-cms
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```bash
cp .env.example .env.local
```

필수 환경 변수 설정:

```env
# Notion API
NOTION_TOKEN=ntn_YOUR_TOKEN_HERE
NOTION_DB_TUTORIALS=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_DB_MATERIALS=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_DB_COMBOS=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_DB_SEASONS=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_DB_CATEGORIES=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# 사이트 URL
NEXT_PUBLIC_SITE_URL=https://pressco21.vercel.app
```

**Notion Integration 설정 가이드**: [docs/NOTION-INTEGRATION-GUIDE.md](docs/NOTION-INTEGRATION-GUIDE.md)

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

---

## 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run migrate:subdomain` | 서브도메인 전환 자동화 (권장) |
| `npm run migrate:rollback` | 서브도메인 전환 롤백 |

---

## 서브도메인 전환

### 개요

기존 Vercel 도메인(`pressco21.vercel.app`)을 서브도메인(`content.foreverlove.co.kr`)으로 자동 전환합니다.

### 빠른 시작

```bash
# 1. 변경 사항 미리보기
npm run migrate:subdomain -- --preview

# 2. 실제 전환 실행
npm run migrate:subdomain

# 3. 롤백 (필요 시)
npm run migrate:rollback
```

### 기능

- ✅ `.env.local` 환경 변수 자동 업데이트
- ✅ `layout.tsx`, `sitemap.ts`, `robots.ts` 자동 수정
- ✅ `vercel.json` 리다이렉트 설정 생성
- ✅ 자동 백업 생성 (`.backup` 파일)
- ✅ 변경 사항 미리보기
- ✅ 안전한 롤백 기능

### 상세 가이드

**전체 실행 가이드**: [docs/SUBDOMAIN-MIGRATION-GUIDE.md](docs/SUBDOMAIN-MIGRATION-GUIDE.md)

**전략 문서**: [docs/MAKESHOP-INTEGRATION-STRATEGY.md](docs/MAKESHOP-INTEGRATION-STRATEGY.md)

### 주요 단계

1. **DNS 설정** (5분) — 도메인 등록업체에서 CNAME 레코드 추가
2. **스크립트 실행** (1분) — `npm run migrate:subdomain`
3. **Vercel 설정** (5분) — 도메인 추가 + 환경 변수 업데이트
4. **배포** (2분) — `git push`

**총 소요 시간**: 약 15분 (DNS 전파 대기 제외)

---

## 기술 스택

### 코어

- **Next.js 16** — App Router, React 19, Turbopack
- **TypeScript** — 타입 안전성
- **Tailwind CSS v4** — oklch 색상 시스템
- **shadcn/ui** — new-york 스타일 컴포넌트

### 데이터 & API

- **Notion Official SDK** (`@notionhq/client` + `notion-to-md`)
- **메이크샵 Open API** — 상품/주문 조회 (시간당 500회 제한)
- **ISR 캐싱** — `unstable_cache`로 Notion API 호출 최적화

### 라이브러리

- **React Hook Form** + **Zod** — 폼 검증
- **jsPDF** — PDF 견적서 자동 생성
- **Recharts** — 차트 (매출 대시보드)
- **DOMPurify** — XSS 방지 (마크다운 새니타이제이션)

---

## 프로젝트 구조

```
notion-cms/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (routes)/             # 페이지 라우트
│   │   ├── api/                  # API Routes
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── sitemap.ts            # 동적 사이트맵
│   │   └── robots.ts             # robots.txt
│   ├── components/               # React 컴포넌트
│   │   ├── layout/               # Header, Footer
│   │   ├── shared/               # 공유 컴포넌트
│   │   └── ui/                   # shadcn/ui 컴포넌트
│   ├── lib/                      # 유틸리티 함수
│   │   ├── notion.ts             # Notion API 클라이언트
│   │   ├── image.ts              # 이미지 폴백 헬퍼
│   │   └── utils.ts              # cn() 등
│   └── types/                    # TypeScript 타입 정의
├── scripts/                      # 자동화 스크립트
│   ├── subdomain-migration.ts    # 서브도메인 전환 스크립트
│   ├── generate-youtube-description.ts
│   └── generate-instagram-card.ts
├── docs/                         # 프로젝트 문서
│   ├── SUBDOMAIN-MIGRATION-GUIDE.md
│   ├── MAKESHOP-INTEGRATION-STRATEGY.md
│   ├── FAQ-INQUIRY-AUTOMATION.md
│   └── PRESSCO21-STRATEGY.md
└── public/                       # 정적 파일
    └── images/
```

---

## 주요 문서

| 문서 | 설명 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | AI 에이전트 가이드 (코딩 컨벤션, 아키텍처) |
| [SUBDOMAIN-MIGRATION-GUIDE.md](docs/SUBDOMAIN-MIGRATION-GUIDE.md) | 서브도메인 전환 실행 가이드 |
| [MAKESHOP-INTEGRATION-STRATEGY.md](docs/MAKESHOP-INTEGRATION-STRATEGY.md) | 메이크샵 통합 전략 문서 |
| [FAQ-INQUIRY-AUTOMATION.md](docs/FAQ-INQUIRY-AUTOMATION.md) | FAQ/문의 자동화 시스템 기술 문서 |
| [PRESSCO21-STRATEGY.md](docs/PRESSCO21-STRATEGY.md) | 전체 사업 전략 |

---

## 배포

### Vercel (권장)

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

**환경 변수 설정**:
- Vercel Dashboard → Settings → Environment Variables
- `.env.example` 참조하여 모든 환경 변수 추가

### 수동 빌드

```bash
npm run build
npm run start
```

---

## 라이선스

MIT License

---

## 문의

프로젝트 관련 문의: [www.foreverlove.co.kr/contact](https://www.foreverlove.co.kr/contact)

---

**Built with ❤️ by PRESSCO 21**
