# DB 스키마 설계서 (DB_SCHEMA)

**작성자**: db-architect
**날짜**: 2026-02-12
**버전**: 1.0

---

## 1. 개요

업무 관리 시스템 고도화를 위한 DB 스키마 변경:
1. **신규 DB**: `NOTION_DB_TASK_TEMPLATES` (작업 템플릿)
2. **기존 DB 수정**: `NOTION_DB_TASKS` (시간 추적, 노트, 첨부파일)

---

## 2. 신규 DB: Task Templates

### 2.1 Notion DB 생성

**DB 이름**: `Task Templates`
**환경 변수**: `NOTION_DB_TASK_TEMPLATES`

### 2.2 스키마

| 속성명 | Notion 타입 | TypeScript 타입 | 필수 | 설명 |
|--------|------------|----------------|------|------|
| **title** | title | string | ✅ | 템플릿명 (예: "API 개발") |
| **workArea** | select | string | ✅ | 업무 영역 (개발/디자인/마케팅 등) |
| **estimatedTime** | number | number | ✅ | 예상 소요 시간 (시간 단위) |
| **priority** | number | number | ✅ | 우선순위 (1-10) |
| **impact** | number | number | ✅ | 영향도 (1-10) |
| **checklist** | rich_text | string | ❌ | 체크리스트 (JSON 문자열) |
| **description** | rich_text | string | ❌ | 템플릿 설명 |
| **createdAt** | created_time | string | - | 생성일 (자동) |

### 2.3 Select 옵션 (workArea)

기존 `NOTION_DB_WORK_AREAS`와 동기화:
- 개발
- 디자인
- 마케팅
- 콘텐츠
- 교육
- 경영지원
- 기타

### 2.4 체크리스트 JSON 형식

```json
[
  {
    "id": "1",
    "text": "요구사항 분석",
    "checked": false
  },
  {
    "id": "2",
    "text": "설계 문서 작성",
    "checked": false
  },
  {
    "id": "3",
    "text": "코드 구현",
    "checked": false
  }
]
```

**저장 방식**:
- Notion rich_text에 `JSON.stringify()` 결과 저장
- 조회 시 `JSON.parse()` 후 사용

**검증 규칙**:
- 최대 20개 항목
- 각 항목은 최대 200자
- id는 문자열 (UUID 또는 숫자)

### 2.5 TypeScript 인터페이스

```typescript
interface TaskTemplate {
  id: string;
  title: string;
  workArea: string;
  estimatedTime: number; // 시간
  priority: number; // 1-10
  impact: number; // 1-10
  checklist?: ChecklistItem[];
  description?: string;
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface TaskTemplateInput {
  title: string;
  workArea: string;
  estimatedTime: number;
  priority: number;
  impact: number;
  checklist?: ChecklistItem[];
  description?: string;
}
```

---

## 3. 기존 DB 수정: Tasks

### 3.1 추가 속성

| 속성명 | Notion 타입 | TypeScript 타입 | 필수 | 설명 |
|--------|------------|----------------|------|------|
| **actualTime** | number | number | ❌ | 실제 소요 시간 (초 단위) |
| **notes** | rich_text | string | ❌ | 작업 노트 (마크다운) |
| **attachments** | rich_text | string | ❌ | 첨부파일 목록 (JSON 문자열) |

### 3.2 actualTime (시간 추적)

**단위**: 초 (seconds)

**이유**:
- Notion number 타입은 소수점 지원하지 않음
- 초 단위로 저장하면 정확한 시간 측정 가능
- 표시 시 `formatSeconds()` 함수로 "2시간 30분 15초" 변환

**예시**:
- 2시간 30분 15초 → `9015` 초
- 45분 → `2700` 초

**저장 방식**:
- 타이머 중지 시 누적 시간 업데이트
- 기존 값 + 새 값 (덧셈)

### 3.3 notes (작업 노트)

**형식**: 마크다운 (Markdown)

**예시**:
```markdown
## 진행 상황
- [x] 요구사항 분석 완료
- [ ] 설계 진행 중

## 이슈
- API 응답 시간이 느림 (500ms 이상)

## 다음 단계
1. 캐싱 전략 수립
2. DB 인덱스 최적화
```

**제한**:
- 최대 10,000자 (Notion rich_text 제한)
- 이미지는 URL만 지원 (Blob 저장 안 함)

**렌더링**:
- 표시 시 `ContentRenderer` 사용 (DOMPurify 보안)

### 3.4 attachments (첨부파일)

**형식**: JSON 배열 (문자열로 저장)

**구조**:
```json
[
  {
    "url": "https://blob.vercel-storage.com/tasks/2026-02-12/task-123/file1.pdf",
    "name": "요구사항.pdf",
    "size": 1234567,
    "uploadedAt": "2026-02-12T10:00:00.000Z"
  },
  {
    "url": "https://blob.vercel-storage.com/tasks/2026-02-12/task-123/design.png",
    "name": "디자인.png",
    "size": 567890,
    "uploadedAt": "2026-02-12T11:00:00.000Z"
  }
]
```

**저장 방식**:
- Vercel Blob에 파일 업로드 → URL 반환
- JSON 배열에 메타데이터 추가
- `JSON.stringify()` → Notion rich_text에 저장

**조회 방식**:
- Notion에서 rich_text 조회
- `JSON.parse()` → 배열로 변환
- UI에서 목록 렌더링

**파일 경로**:
```
tasks/
  └── 2026-02-12/           # 날짜별 폴더
      └── task-abc123/      # 작업 ID
          ├── file1.pdf
          └── design.png
```

**제한**:
- 최대 파일 수: 10개 (권장)
- 파일 크기: 5MB
- 허용 타입: 이미지, PDF, 문서

### 3.5 TypeScript 인터페이스 수정

```typescript
interface Task {
  id: string;
  title: string;
  workArea: string;
  project?: string;
  dueDate: string;
  status: TaskStatus;
  priority: number;
  impact: number;
  priorityScore: number;
  estimatedTime?: number;
  actualTime?: number; // ⬅️ 추가
  assignee?: string;
  checklist?: ChecklistItem[];
  description?: string;
  notes?: string; // ⬅️ 추가 (마크다운)
  attachments?: TaskAttachment[]; // ⬅️ 추가
  createdAt: string;
  updatedAt: string;
}

interface TaskAttachment {
  url: string;
  name: string;
  size: number; // bytes
  uploadedAt: string; // ISO 8601
}
```

---

## 4. 인덱싱 및 쿼리 최적화

### 4.1 Notion API 쿼리

**Task Templates 조회**:
```typescript
await notion.databases.query({
  database_id: process.env.NOTION_DB_TASK_TEMPLATES!,
  sorts: [
    { property: "createdAt", direction: "descending" }
  ]
});
```

**Tasks 필터 쿼리** (검색/필터):
- Notion API는 클라이언트 사이드 필터링 권장 (작은 데이터셋)
- 서버에서 전체 조회 후 클라이언트에서 필터링

### 4.2 캐싱 전략

**Task Templates**:
- ISR 캐싱: `3600초` (1시간)
- 변경 빈도 낮음

**Tasks**:
- ISR 캐싱: `600초` (10분)
- 변경 시 `revalidatePath("/work/tasks")`

---

## 5. 데이터 마이그레이션

### 5.1 신규 DB 생성 절차

1. **Notion에서 DB 생성**:
   - "Task Templates" 이름으로 생성
   - 스키마 설정 (위 표 참조)
   - Integration 연결

2. **환경 변수 설정**:
   ```bash
   NOTION_DB_TASK_TEMPLATES=<DB_ID>
   ```

3. **검증**:
   - `getTaskTemplates()` 함수 실행
   - 빈 배열 반환 확인

### 5.2 기존 DB 수정 절차

1. **Notion에서 속성 추가**:
   - `actualTime` (number)
   - `notes` (rich_text)
   - `attachments` (rich_text)

2. **기본값**: 모두 비어있음 (선택 속성)

3. **검증**:
   - 기존 작업 조회 시 에러 없음 확인
   - `actualTime` 없으면 `undefined` 처리

---

## 6. 백업 및 복구

### 6.1 백업 전략

- **Notion**: 자동 백업 (Notion 자체 기능)
- **Vercel Blob**: 파일은 영구 저장 (삭제 전까지)
- **데이터 내보내기**: Notion API로 JSON 덤프 가능

### 6.2 복구 절차

1. Notion DB 복원 (Notion UI)
2. Vercel Blob 파일은 URL로 접근 가능 (영구)
3. 환경 변수 재설정

---

## 7. 보안 고려사항

### 7.1 Notion Integration 권한

- **읽기**: Templates, Tasks DB
- **쓰기**: Templates, Tasks DB
- **최소 권한 원칙**: 필요한 DB만 연결

### 7.2 파일 접근 권한

- Vercel Blob: `access: "public"`
- 이유: 관리자만 접근 (인증 시스템 없음)
- 향후: 인증 시스템 추가 시 `access: "private"` 변경

### 7.3 데이터 검증

- **타입 검증**: Zod 스키마 사용
- **XSS 방지**: DOMPurify로 노트 렌더링
- **파일 검증**: MIME 타입 + 확장자 이중 체크

---

## 8. 성능 고려사항

### 8.1 데이터 크기

| 항목 | 예상 크기 | 제한 |
|------|----------|------|
| Templates | ~100개 | 없음 |
| Tasks | ~10,000개 | Notion API 페이지네이션 |
| 첨부파일 (개당) | ~1MB | 5MB |
| 노트 (개당) | ~5KB | 10,000자 |

### 8.2 쿼리 성능

- **Templates 조회**: ~200ms (캐싱 시 0ms)
- **Tasks 전체 조회**: ~500ms (100개 기준)
- **Tasks 필터링**: ~10ms (클라이언트)

### 8.3 최적화 방안

1. **페이지네이션**: Tasks 100개씩 조회
2. **가상 스크롤**: 큰 리스트는 react-window 사용
3. **캐싱**: ISR + revalidatePath

---

## 9. 모니터링

### 9.1 메트릭

- **API 호출 수**: Notion API rate limit (하루 3,000회)
- **파일 저장 용량**: Vercel Blob (1GB 무료)
- **DB 크기**: Notion 페이지 수

### 9.2 알림

- Notion API rate limit 80% 도달 시 경고
- Vercel Blob 용량 80% 도달 시 경고

---

## 10. Notion DB 생성 스크립트 (참고)

### 10.1 수동 생성 (권장)

1. Notion에서 새 페이지 생성
2. `/table` → "Task Templates"
3. 속성 추가 (위 스키마 참조)
4. Integration 연결
5. DB ID 복사 (URL에서 마지막 32자)

### 10.2 API 생성 (선택)

```typescript
// 참고용 - 실제로는 Notion UI에서 생성 권장
const response = await notion.databases.create({
  parent: {
    type: "page_id",
    page_id: "워크스페이스 페이지 ID",
  },
  title: [
    {
      type: "text",
      text: { content: "Task Templates" },
    },
  ],
  properties: {
    title: { title: {} },
    workArea: { select: { options: [...] } },
    estimatedTime: { number: { format: "number" } },
    priority: { number: { format: "number" } },
    impact: { number: { format: "number" } },
    checklist: { rich_text: {} },
    description: { rich_text: {} },
  },
});
```

---

**승인 대기 중** ⏳
