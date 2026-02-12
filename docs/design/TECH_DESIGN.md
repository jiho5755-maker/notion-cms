# 기술 설계서 (TECH_DESIGN)

**작성자**: fullstack-architect
**날짜**: 2026-02-12
**버전**: 1.0

---

## 1. 시스템 개요

업무 관리 시스템에 4개 핵심 기능을 추가하여 실무 활용도를 높입니다:
1. **검색 및 필터링** — 작업 검색/필터링
2. **시간 추적** — 실시간 타이머
3. **작업 템플릿** — 반복 작업 자동화
4. **노트 및 첨부파일** — 컨텍스트 유지

---

## 2. 아키텍처 설계

### 2.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Side                           │
├─────────────────────────────────────────────────────────────┤
│  TaskFilter (검색/필터) ──→ URL Query Params                │
│  TimeTracker (타이머)   ──→ localStorage (임시)              │
│  TemplateForm (템플릿)  ──→ Server Actions                   │
│  NoteEditor (노트)      ──→ Server Actions                   │
│  FileUpload (첨부)      ──→ /api/upload-task-attachment     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        Server Side                           │
├─────────────────────────────────────────────────────────────┤
│  Server Actions (actions/work.ts)                           │
│  ├─ createTaskTemplate()                                    │
│  ├─ deleteTaskTemplate()                                    │
│  ├─ createTaskFromTemplate()                                │
│  ├─ updateTaskTimeTracking()                                │
│  ├─ updateTaskNotes()                                       │
│  └─ uploadTaskAttachment()                                  │
│                                                              │
│  API Routes                                                  │
│  └─ /api/upload-task-attachment/route.ts → Vercel Blob     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                         Data Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Notion API                                                  │
│  ├─ NOTION_DB_TASKS (수정: actualTime, notes, attachments)  │
│  └─ NOTION_DB_TASK_TEMPLATES (신규)                         │
│                                                              │
│  Vercel Blob Storage                                         │
│  └─ tasks/YYYY-MM-DD/{taskId}/{randomId}.ext               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 기능별 기술 설계

### 3.1 검색 및 필터링

**아키텍처 패턴**: Client-side filtering with URL state

**이유**:
- 작업 수가 많지 않음 (< 1000개 예상) → 클라이언트 필터링 충분
- URL 쿼리 파라미터로 필터 상태 공유 가능
- 서버 부하 없음, 즉각적인 반응

**구현**:
1. `useSearchParams` + `useRouter`로 URL 쿼리 관리
2. 필터 옵션 변경 시 URL 업데이트
3. 페이지 컴포넌트에서 쿼리 파라미터 읽어서 필터링

**타입**:
```typescript
interface FilterOptions {
  workArea?: string;
  status?: TaskStatus;
  priorityGrade?: PriorityGrade;
  assignee?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}
```

**URL 구조**:
```
/work/tasks?workArea=개발&status=진행중&search=API
```

---

### 3.2 시간 추적

**아키텍처 패턴**: Client timer + Server persistence

**타이머 로직**:
1. 시작: `localStorage`에 `startTime` 저장
2. 경과 시간: `setInterval`로 매초 계산
3. 중지: 총 경과 시간 계산 → Server Action 호출
4. 일시정지: 현재까지 경과 시간 누적 → `localStorage` 업데이트

**새로고침 대응**:
- `localStorage`에 `{ taskId, startTime, accumulatedSeconds }` 저장
- 컴포넌트 마운트 시 복원

**데이터 구조**:
```typescript
// localStorage
interface TimerState {
  taskId: string;
  startTime: number; // timestamp
  accumulatedSeconds: number;
}

// Notion DB (Tasks)
{
  actualTime: number; // 총 소요 시간 (초)
}
```

**Server Action**:
```typescript
async function updateTaskTimeTracking(
  taskId: string,
  additionalSeconds: number
): Promise<{ success: boolean }> {
  // 기존 actualTime 조회
  // 새 시간 추가
  // Notion DB 업데이트
}
```

---

### 3.3 작업 템플릿

**아키텍처 패턴**: CRUD with Notion DB

**DB 구조**:
```
NOTION_DB_TASK_TEMPLATES
├─ title (제목) — title
├─ workArea (업무 영역) — select
├─ estimatedTime (예상 시간) — number
├─ priority (우선순위) — number
├─ impact (영향도) — number
├─ checklist (체크리스트) — rich_text (JSON 문자열)
├─ description (설명) — rich_text
└─ createdAt (생성일) — created_time
```

**Server Actions**:
1. `getTaskTemplates()` — 템플릿 목록 조회
2. `createTaskTemplate(input)` — 템플릿 생성
3. `deleteTaskTemplate(id)` — 템플릿 삭제
4. `createTaskFromTemplate(templateId)` — 템플릿에서 작업 생성
   - 템플릿 조회
   - Tasks DB에 새 작업 생성 (마감일은 "오늘 + 예상시간"으로 설정)
   - 체크리스트 복사

**체크리스트 JSON 형식**:
```json
[
  { "id": "1", "text": "요구사항 분석", "checked": false },
  { "id": "2", "text": "설계 문서 작성", "checked": false }
]
```

---

### 3.4 노트 및 첨부파일

**아키텍처 패턴**: Rich text + Blob storage

**Notion DB 수정 (Tasks)**:
```
notes — rich_text (마크다운)
attachments — rich_text (JSON 문자열)
```

**첨부파일 JSON 형식**:
```json
[
  {
    "url": "https://blob.vercel-storage.com/tasks/2026-02-12/task-123/file1.pdf",
    "name": "요구사항.pdf",
    "size": 1234567,
    "uploadedAt": "2026-02-12T10:00:00.000Z"
  }
]
```

**파일 업로드 흐름**:
1. 클라이언트: 파일 선택 → FormData 생성
2. API Route: `/api/upload-task-attachment`
   - 검증: MIME 타입 + 확장자 (5MB 제한)
   - Vercel Blob 업로드: `tasks/YYYY-MM-DD/{taskId}/{randomId}.ext`
   - URL 반환
3. 클라이언트: URL 받아서 Server Action 호출
4. Server Action: `attachments` JSON 배열에 추가

**Server Actions**:
```typescript
async function updateTaskNotes(
  taskId: string,
  notes: string
): Promise<{ success: boolean }>;

async function addTaskAttachment(
  taskId: string,
  attachment: {
    url: string;
    name: string;
    size: number;
  }
): Promise<{ success: boolean }>;

async function removeTaskAttachment(
  taskId: string,
  attachmentUrl: string
): Promise<{ success: boolean }>;
```

---

## 4. 보안 고려사항

### 4.1 파일 업로드 보안
- **허용 MIME 타입**: `image/*`, `application/pdf`, `text/*`, `application/vnd.*` (문서)
- **금지 확장자**: `.exe`, `.sh`, `.bat`, `.cmd`, `.com`
- **크기 제한**: 5MB
- **경로 랜덤화**: 예측 불가능한 경로

### 4.2 XSS 방지
- 노트 렌더링 시 DOMPurify 사용 (기존 ContentRenderer 패턴)
- 템플릿 체크리스트는 JSON.parse 전 검증

### 4.3 인증
- 모든 Server Action은 `"use server"` 지시자 사용
- API Route는 Vercel Blob Token으로 보호됨

---

## 5. 성능 최적화

### 5.1 클라이언트 최적화
- **검색/필터**: debounce 500ms (검색 입력)
- **타이머**: `setInterval` 1초 (UI 업데이트)
- **파일 업로드**: 프로그레스 바 표시

### 5.2 서버 최적화
- **ISR 캐싱**: `getTaskTemplates()` — 3600초
- **revalidatePath**: 작업 생성/수정 시 `/work/tasks`, `/work/daily` 재검증

### 5.3 데이터 크기
- 첨부파일: Blob URL만 저장 (바이너리 저장 안 함)
- 노트: 최대 10,000자 제한 (Notion rich_text 제한)

---

## 6. 에러 처리

### 6.1 타이머 에러
- `localStorage` 접근 실패 → 메모리 폴백
- `setInterval` 누락 → 컴포넌트 언마운트 시 정리

### 6.2 파일 업로드 에러
- 네트워크 에러 → 재시도 버튼
- 크기 초과 → toast 경고
- Vercel Blob 에러 → 500 응답

### 6.3 Notion API 에러
- Rate limit → 지수 백오프 재시도
- DB 접근 실패 → toast 에러 + 빈 배열 반환

---

## 7. 테스트 전략

### 7.1 단위 테스트
- 타이머 로직 (Jest)
- 필터 함수 (Jest)

### 7.2 E2E 테스트 (Playwright)
1. 검색/필터 테스트:
   - 검색어 입력 → 결과 확인
   - 필터 선택 → URL 업데이트 확인
2. 타이머 테스트:
   - 시작 → 경과 시간 증가
   - 중지 → DB 업데이트 확인
3. 템플릿 테스트:
   - 템플릿 생성 → 목록 확인
   - 템플릿에서 작업 생성 → Tasks 페이지 확인
4. 노트/첨부 테스트:
   - 노트 저장 → 재조회 확인
   - 파일 업로드 → 다운로드 링크 확인

---

## 8. 배포 계획

### 8.1 환경 변수
```bash
# .env.local
NOTION_DB_TASK_TEMPLATES=<새 DB ID>
```

### 8.2 Notion DB 생성
1. Notion에서 `Task Templates` DB 생성
2. 스키마 설정 (DB_SCHEMA.md 참조)
3. Integration 연결
4. DB ID 복사 → `.env.local`

### 8.3 배포 순서
1. 로컬 테스트
2. Git commit/push
3. Vercel 자동 배포
4. Production 환경 변수 설정
5. 스모크 테스트

---

## 9. 의존성

### 9.1 신규 설치 불필요
- 모든 기능은 기존 라이브러리로 구현 가능
- Vercel Blob: 이미 설치됨
- shadcn/ui: 이미 설치됨

### 9.2 기존 패턴 재사용
- 파일 업로드: `src/app/api/upload/route.ts` 패턴
- Server Actions: `src/actions/work.ts` 확장
- 클라이언트 컴포넌트: 기존 패턴

---

## 10. 향후 확장 가능성

### 10.1 단기 (1개월)
- 캘린더 뷰 (full calendar 라이브러리)
- 간트 차트 (react-gantt-chart)

### 10.2 중기 (3개월)
- 알림 시스템 (이메일/푸시)
- 모바일 PWA

### 10.3 장기 (6개월)
- AI 자동 우선순위 추천
- 음성 메모 첨부

---

**승인 대기 중** ⏳
