# CLAUDE.md — PRESSCO 21 (notion-cms)

## 프로젝트 개요

PRESSCO 21(프레스코21) 웹 콘텐츠 허브. 노션 CMS + Next.js 15 기반으로 압화(pressed flower) 전문 콘텐츠를 제공한다.

### 회사 프로필
- **브랜드**: 프레스코21 (PRESSCO 21) — "꽃으로 노는 모든 방법"
- **URL**: www.foreverlove.co.kr (메이크샵 쇼핑몰)
- **업종**: 압화 전문 — 재료, 도구, 만들기 키트, 교육
- **고객**: B2C(DIY 취미인) + B2B(학교, 복지관, 기업, 강사)
- **기존 도구**: 메이크샵 + 사방넷(재고/발주) + 얼마에요 ERP

### 전략 문서
- `docs/PRESSCO21-STRATEGY.md` — 4개 축, 21개 아이디어 전체 전략

## 기술 스택

```
Framework:     Next.js 15 (App Router, TypeScript, Turbopack)
CMS 연동:      NotCMS (1차) + @notionhq/client (고급 시)
스타일링:       Tailwind CSS v4 (oklch) + shadcn/ui (new-york)
이미지:         next/image + API Route 프록시 (노션 이미지 만료 해결)
PDF 생성:      @react-pdf/renderer (견적서, 필요 시 설치)
외부 API:      메이크샵 Open API (상품/주문 데이터)
배포:          Vercel (ISR, 무료 티어)
```

## 개발 명령어

```bash
npm run dev          # 개발 서버 (http://localhost:3000, Turbopack)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 9
```

## 디렉토리 구조 (계획)

```
src/
├── app/
│   ├── layout.tsx              # Root (Geist 폰트, Toaster)
│   ├── page.tsx                # 랜딩 페이지
│   ├── tutorials/              # 튜토리얼 허브 (Idea 2)
│   │   ├── page.tsx            # 카드 그리드
│   │   └── [slug]/page.tsx     # 상세 (단계별 + 재료 사이드바)
│   ├── combos/                 # 재료 조합 가이드 (Idea 12)
│   │   ├── page.tsx            # 갤러리
│   │   └── [id]/page.tsx       # 상세 + "한 번에 구매"
│   ├── seasons/                # 시즌 캠페인 (Idea 4)
│   │   └── [slug]/page.tsx     # 시즌 랜딩
│   ├── wholesale/              # B2B 카탈로그 (Idea 8)
│   │   ├── page.tsx            # 랜딩
│   │   └── catalog/page.tsx    # 카탈로그
│   ├── quotation/              # 셀프 견적서 (Idea 14)
│   │   ├── page.tsx            # 견적서 작성
│   │   └── history/page.tsx    # 견적 이력
│   └── api/
│       ├── notion-image/       # 노션 이미지 프록시
│       └── makeshop/           # 메이크샵 API 프록시
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트
│   ├── layout/                 # 헤더, 푸터, 네비게이션
│   └── shared/                 # 공유 컴포넌트
├── lib/
│   ├── utils.ts                # cn() (clsx + tailwind-merge)
│   ├── notion.ts               # NotCMS 또는 Notion API 클라이언트
│   └── makeshop.ts             # 메이크샵 API 유틸
└── types/
    └── index.ts                # 공통 타입
```

## 핵심 규칙

### React 및 Next.js
- Server Component 기본, "use client" 최소화
- ISR(Incremental Static Regeneration) 적극 활용 (노션 데이터는 자주 변경되지 않음)
- generateMetadata로 SEO 최적화

### 노션 CMS 연동
- **NotCMS** 우선 사용 (간편한 노션→웹 연동)
- 노션 이미지 URL은 1시간 후 만료 → `/api/notion-image` 프록시로 해결
- 노션 DB 속성명은 영어 권장 (API 호환)

### 메이크샵 API
- 시간당 조회 500회 제한 → 캐싱 전략 필수
- CORS 이슈 → Next.js API Route 프록시 사용
- 수정 권한은 어드민에서 별도 허용 필요

### 코딩 컨벤션
- **한국어**: 커밋 메시지, 코드 주석, UI 텍스트
- **영어 식별자**: 변수명 camelCase, 타입명 PascalCase
- cn() 유틸: `import { cn } from "@/lib/utils"`
- Toaster: `import { Toaster } from "sonner"`

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

### 주요 워크플로우
- **W1 시즌 캠페인**: content-strategist → product-merchandiser → frontend-engineer → marketing-strategist
- **W5 기능 구현**: product-manager → fullstack-architect → frontend-engineer + backend-engineer → code-reviewer → qa-engineer

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

### Phase 4: 장기 성장
9. 블로그 + 갤러리 + 백과사전
10. 마케팅 분석 대시보드
