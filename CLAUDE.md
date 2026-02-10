# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

PRESSCO 21(프레스코21) 웹 콘텐츠 허브. 노션 CMS + Next.js 기반으로 압화(pressed flower) 전문 콘텐츠를 제공한다.
- **브랜드**: 프레스코21 — "꽃으로 노는 모든 방법"
- **고객**: B2C(DIY 취미인) + B2B(학교, 복지관, 기업, 강사)
- **쇼핑몰**: www.foreverlove.co.kr (메이크샵)
- **전략 문서**: `docs/PRESSCO21-STRATEGY.md`

## 개발 명령어

```bash
npm run dev          # 개발 서버 (http://localhost:3000, Turbopack)
npm run build        # 프로덕션 빌드 (Turbopack)
npm run lint         # ESLint 9 (eslint-config-next core-web-vitals + typescript)
npm run start        # 프로덕션 서버
```

## 기술 스택

- **Next.js 16** (App Router, TypeScript, Turbopack) — React 19
- **Notion Official SDK** (`@notionhq/client` + `notion-to-md`) — 노션 CMS 연동
- **Tailwind CSS v4** (oklch) + **shadcn/ui** (new-york 스타일)
- **메이크샵 Open API** — 상품/주문 데이터 (시간당 조회 500회 제한)
- **Vercel** 배포 (ISR)

## 아키텍처

### 데이터 흐름: Notion API → 페이지

```
노션 DB → Notion Official API → src/lib/notion.ts (데이터 페칭 + ISR 캐싱)
                                → src/app/*/page.tsx (Server Component에서 직접 호출)
```

**Notion 클라이언트 패턴** — `getNotionClient()`로 클라이언트를 생성. `NOTION_TOKEN` 환경 변수가 없으면 예외를 발생시키고, try-catch로 빈 배열/null을 반환하여 빌드 실패를 방지한다.

**ISR 캐싱** — `unstable_cache`로 감싸며 목록은 3600초(1시간), 상세는 600초(10분).

**콘텐츠 변환** — `notion-to-md` 라이브러리로 Notion 블록을 마크다운으로 자동 변환.

### 노션 이미지 프록시

노션 S3 signed URL은 ~1시간 후 만료. `/api/notion-image?url=<인코딩된URL>` 프록시로 해결.
- 허용 호스트: `amazonaws.com`, `notion.so`만 허용 (보안)
- 캐싱: 브라우저 1일, CDN 7일

### 노션 DB 스키마 (5개)

환경 변수로 DB ID 관리. 5개 데이터베이스:
- **tutorials** (`NOTION_DB_TUTORIALS`) — 튜토리얼 (slug로 접근)
- **materials** (`NOTION_DB_MATERIALS`) — 재료/상품 (메이크샵 상품 대응)
- **combos** (`NOTION_DB_COMBOS`) — 재료 조합 가이드
- **seasons** (`NOTION_DB_SEASONS`) — 시즌 캠페인
- **categories** (`NOTION_DB_CATEGORIES`) — 분류 체계 (order 정렬)

### 타입 시스템

`src/types/index.ts`에 모든 데이터 모델 정의:
- `Tutorial`, `Combo`, `Season`, `Category`, `Material` — 노션 DB 대응
- `MakeshopProduct`, `MakeshopOrder` — 메이크샵 API 대응
- `PageParams`, `SearchParams` — Next.js App Router용. **`params`는 `Promise`** — `await params` 필수
- `Difficulty` 타입 + `DIFFICULTY_LABELS`, `DIFFICULTY_COLORS` 상수 맵

### 페이지 패턴

모든 페이지는 **Server Component 기본**. 동적 라우트 페이지의 표준 구조:
1. `generateStaticParams()` — ISR용 정적 파라미터 생성
2. `generateMetadata()` — SEO (params는 await 필수)
3. 기본 export — `PageParams` 타입 사용, `notFound()` 처리

라우트별 전용 컴포넌트는 `_components/` 디렉토리에 배치 (예: `tutorials/_components/tutorial-grid.tsx`).

### 컴포넌트 구조

- `src/components/ui/` — shadcn/ui 컴포넌트 (수정 지양)
- `src/components/layout/` — Header, Footer, ThemeToggle
- `src/components/shared/` — 도메인 공유 컴포넌트 (DifficultyBadge, TutorialCard, YoutubeEmbed, MaterialSidebar, ContentRenderer)

## 핵심 규칙

### 코딩 컨벤션
- **한국어**: 커밋 메시지, 코드 주석, UI 텍스트
- **영어 식별자**: 변수명 camelCase, 타입명 PascalCase
- `cn()` 유틸: `import { cn } from "@/lib/utils"` (clsx + tailwind-merge)
- `Toaster`: `import { Toaster } from "sonner"` — layout.tsx에서 이미 설정됨
- 경로 별칭: `@/*` → `./src/*`

### Next.js 15+ params
- App Router에서 `params`와 `searchParams`는 모두 `Promise` — **반드시 `await`** 필요

### 메이크샵 API
- 시간당 조회 500회 제한 → 캐싱 전략 필수
- CORS 이슈 → Next.js API Route 프록시 사용
- 수정 권한은 어드민에서 별도 허용 필요

### 환경 변수
`.env.example` 참조. `NOTION_TOKEN`이 없으면 Notion 관련 페이지가 빈 데이터로 렌더링됨 (에러 아님).

**Notion Integration 설정:**
1. https://www.notion.so/my-integrations 에서 Internal Integration 생성
2. Token 복사 → `.env.local`의 `NOTION_TOKEN`에 설정
3. 각 데이터베이스에 Integration 연결 (우측 상단 `•••` → `연결`)

## AI 전문가 조직 (25개 에이전트 + coordinator)

> 상세: `.claude/agents/REFERENCE.md` 참조

```
coordinator (총괄) — cyan
├── 기술본부 (9명) — blue
│   fullstack-architect, frontend-engineer, backend-engineer, ui-designer
│   db-architect, devops-engineer, code-reviewer, qa-engineer, security-auditor
├── 사업본부 (4명) — green
│   product-manager, marketing-strategist, sales-analyst, crm-specialist
├── 경영지원본부 (7명) — yellow
│   hr-labor-expert(opus), payroll-tax-expert(opus), accounting-expert
│   document-admin-expert, tax-incentive-expert, employment-subsidy-expert(opus)
│   sme-policy-expert
├── 콘텐츠/교육본부 (3명) — magenta
│   content-strategist, curriculum-designer, product-merchandiser
└── 데이터/지식 (2명) — white
    data-analyst, technical-writer(haiku)
```

### 워크플로우 체계 (2-Tier)
- **원자 워크플로우(AW)**: 2~3명 소단위 재사용 블록 (AW-01~AW-12)
- **복합 워크플로우(CW)**: AW를 조합한 엔드-투-엔드 프로세스 (CW-01~CW-08)
- **게이트**: 기획/설계 결과물 생성 직후 사용자 확인 필수
- **실패 복구**: 빌드 실패/리뷰 불합격 시 피드백 루프, 3회 실패 시 에스컬레이션

## 실행 로드맵

### Phase 1: 판매 촉진 (현재)
1. 노션 워크스페이스 세팅 + DB 설계
2. 튜토리얼 허브 (/tutorials) — NotCMS 연동
3. 재료 조합 가이드 (/combos) — NotCMS 연동
4. 시즌 캠페인 (/seasons) — NotCMS 연동

### Phase 2: 업무 자동화
5. 셀프 견적서 (/quotation) — 메이크샵 API + PDF
6. 고객 매출 관리 — 얼마에요 대체
7. FAQ + 고객 문의 자동화

### Phase 3: B2B 확장
8. B2B 카탈로그 (/wholesale)
