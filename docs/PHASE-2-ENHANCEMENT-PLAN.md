# Phase 2 업무 관리 시스템 고도화 계획

## 목표

기존 업무 관리 시스템을 실무에서 활용 가능한 수준으로 업그레이드

## 구현 기능 (4개)

### 1. 검색 및 필터링 (Search & Filters)
**목적**: 많은 작업 중에서 원하는 작업을 빠르게 찾기

**기능**:
- 키워드 검색 (작업명, 설명)
- 필터:
  - 업무 영역별
  - 상태별 (진행 전/진행 중/완료)
  - 우선순위 등급별 (A/B/C/D)
  - 담당자별
  - 날짜 범위 (시작일/마감일)
- URL 쿼리 파라미터로 필터 상태 저장 (새로고침해도 유지)
- 적용 페이지: `/work/tasks`, `/work/daily`

**기술 스택**:
- 클라이언트 컴포넌트 (상태 관리)
- shadcn/ui Select, Input 컴포넌트
- Next.js useSearchParams, useRouter

---

### 2. 시간 추적 (Time Tracking)
**목적**: 실제 작업 소요 시간을 측정하여 예상 시간과 비교

**기능**:
- 타이머: 시작/중지/일시정지
- 실시간 경과 시간 표시 (HH:MM:SS)
- 자동 저장: 중지 시 총 소요 시간 업데이트
- 작업 카드에 "실제 소요 시간" 표시
- 대시보드에 "예상 vs 실제" 비교 차트

**기술 스택**:
- 클라이언트 컴포넌트 (타이머 로직)
- localStorage (임시 저장, 새로고침 대응)
- Server Action: `updateTaskTimeTracking(taskId, seconds)`
- Notion DB: Tasks DB에 `actualTime` 속성 추가 (number - 초 단위)

---

### 3. 작업 템플릿 (Task Templates)
**목적**: 반복적인 작업 패턴을 템플릿으로 저장하여 빠르게 생성

**기능**:
- 템플릿 관리 페이지 (`/work/templates`)
- 템플릿 생성: 작업명, 업무 영역, 예상 시간, 우선순위, 체크리스트
- 템플릿에서 작업 생성: 클릭 한 번으로 새 작업 추가
- 템플릿 목록: 카드 형태로 표시
- 템플릿 삭제

**기술 스택**:
- 새 Notion DB: `NOTION_DB_TASK_TEMPLATES`
- 스키마:
  - title (제목) - title
  - workArea (업무 영역) - select
  - estimatedTime (예상 시간) - number
  - priority (우선순위) - number
  - impact (영향도) - number
  - checklist (체크리스트) - rich_text (JSON)
  - description (설명) - rich_text
- Server Actions:
  - `getTaskTemplates()`
  - `createTaskTemplate(input)`
  - `deleteTaskTemplate(id)`
  - `createTaskFromTemplate(templateId)`

---

### 4. 작업 노트 및 첨부파일 (Notes & Attachments)
**목적**: 작업 진행 중 메모와 파일을 첨부하여 컨텍스트 유지

**기능**:
- 작업 상세 모달에 "노트" 탭 추가
- 마크다운 에디터 (간단한 텍스트 입력)
- 파일 첨부: Vercel Blob 활용 (기존 inquiries 패턴 재사용)
- 첨부파일 다운로드 링크
- 작업 카드에 "노트/첨부 있음" 아이콘 표시

**기술 스택**:
- Tasks DB 수정:
  - `notes` (노트) - rich_text
  - `attachments` (첨부파일) - files (또는 rich_text로 URL 배열)
- Server Actions:
  - `updateTaskNotes(taskId, notes)`
  - `uploadTaskAttachment(taskId, file)` → Vercel Blob
- UI:
  - 텍스트 에디어 (textarea)
  - 파일 업로드 버튼 (기존 contact-form.tsx 패턴)

---

## 아키텍처 개요

### 데이터 흐름

```
사용자 → 클라이언트 컴포넌트 (검색/필터/타이머/노트)
         ↓
      Server Actions (데이터 검증)
         ↓
      Notion API (DB 업데이트)
         ↓
      revalidatePath → 페이지 갱신
```

### 파일 구조

```
src/
├── types/work.ts (타입 추가)
│   ├── FilterOptions
│   ├── TaskTemplate
│   ├── TaskTemplateInput
│
├── lib/work.ts (데이터 페칭)
│   ├── getTaskTemplates()
│
├── actions/work.ts (Server Actions)
│   ├── createTaskTemplate()
│   ├── deleteTaskTemplate()
│   ├── createTaskFromTemplate()
│   ├── updateTaskTimeTracking()
│   ├── updateTaskNotes()
│   ├── uploadTaskAttachment()
│
├── app/work/
│   ├── templates/page.tsx (템플릿 관리)
│   ├── _components/
│   │   ├── task-filter.tsx (클라이언트)
│   │   ├── task-search.tsx (클라이언트)
│   │   ├── time-tracker.tsx (클라이언트)
│   │   ├── template-card.tsx
│   │   ├── template-form.tsx (클라이언트)
│   │   ├── task-note-editor.tsx (클라이언트)
│   │   └── task-attachment-upload.tsx (클라이언트)
│
└── app/api/upload-task-attachment/route.ts (Vercel Blob 업로드)
```

---

## 우선순위 및 병렬 처리

### Group A (병렬 진행 가능)
1. **검색 및 필터링** — UI만 수정, DB 변경 없음
2. **시간 추적** — Tasks DB 수정 (actualTime 추가)

### Group B (독립적)
3. **작업 템플릿** — 새 DB 생성, 독립적
4. **노트 및 첨부파일** — Tasks DB 수정 (notes, attachments 추가)

### 구현 순서
1. **설계 단계** (병렬):
   - fullstack-architect: 전체 아키텍처
   - ui-designer: UI/UX 설계
   - db-architect: DB 스키마

2. **구현 단계** (병렬):
   - frontend-engineer: UI 컴포넌트
   - backend-engineer: Server Actions

3. **검증 단계** (순차):
   - qa-engineer: E2E 테스트
   - code-reviewer: 코드 리뷰

4. **배포**:
   - Git commit/push

---

## 에이전트 할당

| 에이전트 | 작업 | 산출물 |
|---------|------|--------|
| fullstack-architect | 전체 아키텍처 설계 | TECH_DESIGN |
| ui-designer | UI/UX 설계 | UI_SPEC |
| db-architect | DB 스키마 설계 | DB_SCHEMA |
| frontend-engineer | UI 구현 | CODE |
| backend-engineer | Server Actions 구현 | CODE |
| qa-engineer | E2E 테스트 | BUILD_RESULT |
| code-reviewer | 코드 리뷰 | REVIEW_REPORT |

---

## 예상 산출물

1. **설계 문서**:
   - `docs/design/TECH_DESIGN.md`
   - `docs/design/UI_SPEC.md`
   - `docs/design/DB_SCHEMA.md`

2. **코드**:
   - 10+ 새 파일 생성
   - 5+ 기존 파일 수정

3. **테스트**:
   - `e2e/work-enhancement.spec.ts` (12개 테스트)

4. **환경 변수**:
   - `.env.local`: `NOTION_DB_TASK_TEMPLATES` 추가

---

## 성공 기준

- ✅ 모든 기능이 정상 작동
- ✅ E2E 테스트 통과
- ✅ 빌드 성공 (0 타입 에러)
- ✅ 코드 리뷰 통과
- ✅ Git 커밋/푸시 완료
