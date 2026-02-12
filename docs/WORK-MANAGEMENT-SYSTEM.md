# 업무 일정 관리 시스템 (Work Management System)

## 📋 개요

대표가 18개 업무 영역을 직접 담당하는 조직을 위한 업무 일정 관리 시스템.

**핵심 목표:**
- 계획적이고 치밀한 업무 처리 체계 구축
- 재택 근무자와 원활한 협업
- 저비용으로 시작 → 효과 검증 후 확대

**전략:**
1. **3C 매트릭스** 우선순위화 프레임워크
2. **Notion 중심 통합 시스템**
3. **요일별 테마 시스템** (콘텍스트 스위칭 최소화)

---

## 🎯 3C 매트릭스 (우선순위 자동 계산)

18개 업무를 3가지 기준으로 평가하여 A/B/C/D급으로 자동 분류:

- **Complexity** (복잡도): 1~5점
- **Collaboration** (협업 필요도): 1~5점
- **Consequence** (결과 중요도): 1~5점

### 우선순위 점수 계산 (Notion Formula)
```
priorityScore = complexity × 20 + collaboration × 20 + consequence × 20
```

### 등급 분류
- **A급 (60~100점)**: 당일 필수 - 전략 타임에 집중
- **B급 (40~59점)**: 주간 목표 - 협업 시간에 처리
- **C급 (20~39점)**: 월간 목표 - 여유 시간에 진행
- **D급 (0~19점)**: 보류/위임/삭제

---

## 📅 요일별 테마 시스템

### 월요일 - 제품의 날 🛠️
- 제품 개발, 소싱, 사입, 재료 개발
- A급 업무: 신제품 기획, 재료 소싱

### 화요일 - 마케팅의 날 📣
- SNS, 캠페인, 촬영, 콘텐츠 제작
- A급 업무: 마케팅 전략 수립, 콘텐츠 촬영

### 수요일 - 개발의 날 💻
- 서비스 개발, 홈페이지, 시스템
- A급 업무: 홈페이지 개선, 시스템 구축

### 목요일 - 사람의 날 👥
- 영업 미팅, 인사, 노무, 고객 관리
- A급 업업: 영업 미팅, 협업자 관리

### 금요일 - 정리의 날 💰
- 회계, 세무, 주간 리뷰
- A급 업무: 회계 정리, 주간 회고

---

## 🗄️ Notion DB 스키마 (6개)

### 1. Tasks DB ⭐ 핵심

**용도:** 모든 업무 작업 관리

**속성 (15개):**

| 속성명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `title` | Title | 작업명 | ✅ |
| `status` | Select | 진행 전 / 진행 중 / 완료 / 보류 | ✅ |
| `workArea` | Select | 18개 업무 영역 (제품개발, 영업...) | ✅ |
| `priority` | Select | 긴급 / 높음 / 보통 / 낮음 | ✅ |
| `priorityScore` | Formula | complexity×20 + collaboration×20 + consequence×20 | - |
| `dueDate` | Date | 마감일 | ✅ |
| `estimatedTime` | Number | 예상 시간 (분) | - |
| `actualTime` | Number | 실제 시간 (분) | - |
| `complexity` | Number | 복잡도 1~5 | ✅ |
| `collaboration` | Number | 협업 필요도 1~5 | ✅ |
| `consequence` | Number | 결과 중요도 1~5 | ✅ |
| `project` | Relation | Projects DB 연결 | - |
| `assignedTo` | Relation | Team DB 연결 | - |
| `weekTheme` | Select | 월/화/수/목/금/토/일 | - |
| `notes` | Rich Text | 메모 | - |

**Formula 설정:**
```javascript
// priorityScore
prop("complexity") * 20 + prop("collaboration") * 20 + prop("consequence") * 20
```

**Select 옵션 - workArea (18개):**
1. 제품 개발 🛠️
2. 영업 📊
3. 마케팅 📣
4. 콘텐츠 제작 ✍️
5. 강의 준비 🎓
6. 고객 관리 👥
7. 재고 관리 📦
8. 회계/세무 💰
9. 인사/노무 👔
10. 전산/시스템 💻
11. 협력사 관리 🤝
12. 교육 커리큘럼 📚
13. 홍보/PR 📰
14. 이벤트 기획 🎉
15. 데이터 분석 📈
16. 문서 작업 📄
17. 회의/미팅 🗓️
18. 기타 업무 🔧

**Select 옵션 - status:**
- 진행 전
- 진행 중
- 완료
- 보류

**Select 옵션 - priority:**
- 긴급
- 높음
- 보통
- 낮음

**Select 옵션 - weekTheme:**
- 월요일
- 화요일
- 수요일
- 목요일
- 금요일
- 토요일
- 일요일

---

### 2. Daily Plans DB (일일 계획)

**용도:** 매일 아침 루틴 자동 생성

**속성 (8개):**

| 속성명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `title` | Title | "2026-02-12 일일 계획" | ✅ |
| `date` | Date | 날짜 | ✅ |
| `theme` | Select | 요일 테마 (월/화/수/목/금) | ✅ |
| `top3Tasks` | Relation | Tasks DB (최대 3개) | - |
| `allTasks` | Relation | Tasks DB (전체 예정) | - |
| `completionRate` | Number | 완료율 % | - |
| `totalTime` | Number | 총 소요 시간 (분) | - |
| `reflection` | Rich Text | 하루 회고 | - |

**자동 생성 로직:**
1. 매일 `/work/daily` 접속 시
2. 오늘 날짜로 Daily Plan 조회
3. 없으면 자동 생성:
   - Tasks DB에서 `status="진행 전"` + `dueDate≤오늘`
   - `priorityScore` 높은 순 정렬
   - `weekTheme=오늘` 가중치 +10
   - 상위 3개 선택

---

### 3. Weekly Reviews DB (주간 리뷰)

**용도:** 매주 일요일 자동 생성 (Vercel Cron)

**속성 (10개):**

| 속성명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `title` | Title | "2026-W07 주간 리뷰" | ✅ |
| `weekStart` | Date | 주 시작일 | ✅ |
| `weekEnd` | Date | 주 종료일 | ✅ |
| `totalTasks` | Number | 총 작업 수 | - |
| `completedTasks` | Number | 완료 작업 수 | - |
| `completionRate` | Number | 완료율 % | - |
| `totalTime` | Number | 시간 합계 (분) | - |
| `workAreaBreakdown` | Rich Text | 영역별 통계 | - |
| `topAchievements` | Rich Text | 주요 성과 | - |
| `nextWeekGoals` | Rich Text | 다음 주 목표 | - |

**Vercel Cron:**
```json
{
  "crons": [{
    "path": "/api/cron/weekly-review",
    "schedule": "0 9 * * 0"
  }]
}
```

---

### 4. Team DB (협업자 관리)

**용도:** 재택 근무자 작업 할당 및 추적

**속성 (8개):**

| 속성명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `title` | Title | 이름 | ✅ |
| `role` | Select | 웹디자이너 / 영상 편집자 / 강사 | ✅ |
| `email` | Email | 이메일 | - |
| `phone` | Phone Number | 연락처 | - |
| `assignedTasks` | Relation | Tasks DB | - |
| `completedTasks` | Relation | Tasks DB | - |
| `activeTasksCount` | Rollup | 진행 중 작업 수 | - |
| `notes` | Rich Text | 메모 | - |

**Rollup 설정 - activeTasksCount:**
- Relation: `assignedTasks`
- Property: `status`
- Calculate: `Count values where status = "진행 중"`

---

### 5. Projects DB (프로젝트)

**용도:** 여러 작업을 묶어 관리

**속성 (7개):**

| 속성명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `title` | Title | 프로젝트명 | ✅ |
| `status` | Select | 기획 / 진행 / 완료 / 중단 | ✅ |
| `workArea` | Select | 18개 업무 영역 | ✅ |
| `startDate` | Date | 시작일 | - |
| `endDate` | Date | 종료일 | - |
| `progress` | Number | 진행률 0~100% | - |
| `tasks` | Relation | Tasks DB | - |
| `description` | Rich Text | 설명 | - |

---

### 6. Work Areas DB (업무 영역 마스터)

**용도:** 18개 업무 영역 정의 및 요일 테마 매핑

**속성 (6개):**

| 속성명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `title` | Title | 업무 영역명 | ✅ |
| `icon` | Rich Text | 이모지 | ✅ |
| `color` | Select | blue/green/red/yellow... | ✅ |
| `order` | Number | 정렬 순서 | ✅ |
| `description` | Rich Text | 설명 | - |
| `weekTheme` | Select | 연결된 요일 | - |

**초기 데이터 (18개):**

| 순서 | 영역명 | 아이콘 | 색상 | 요일 테마 |
|------|--------|--------|------|-----------|
| 1 | 제품 개발 | 🛠️ | blue | 월요일 |
| 2 | 영업 | 📊 | green | 목요일 |
| 3 | 마케팅 | 📣 | red | 화요일 |
| 4 | 콘텐츠 제작 | ✍️ | yellow | 화요일 |
| 5 | 강의 준비 | 🎓 | purple | 목요일 |
| 6 | 고객 관리 | 👥 | pink | 목요일 |
| 7 | 재고 관리 | 📦 | orange | 월요일 |
| 8 | 회계/세무 | 💰 | green | 금요일 |
| 9 | 인사/노무 | 👔 | blue | 목요일 |
| 10 | 전산/시스템 | 💻 | gray | 수요일 |
| 11 | 협력사 관리 | 🤝 | brown | 목요일 |
| 12 | 교육 커리큘럼 | 📚 | indigo | 수요일 |
| 13 | 홍보/PR | 📰 | red | 화요일 |
| 14 | 이벤트 기획 | 🎉 | yellow | 화요일 |
| 15 | 데이터 분석 | 📈 | blue | 금요일 |
| 16 | 문서 작업 | 📄 | gray | 금요일 |
| 17 | 회의/미팅 | 🗓️ | purple | 목요일 |
| 18 | 기타 업무 | 🔧 | gray | - |

---

## 🚀 핵심 기능

### 1. 모바일 빠른 입력 (⚡)

**페이지:** `/work/quick-add`

**워크플로우:**
1. 작업명 입력
2. 마감일 선택
3. [저장] 버튼

**자동 처리:**
- `status`: "진행 전"
- `priority`: "보통"
- `complexity`: 3 (기본값)
- `collaboration`: 2 (기본값)
- `consequence`: 3 (기본값)
- `weekTheme`: 마감일 요일로 자동 설정
- `priorityScore`: Formula 자동 계산

**PWA 설정:**
```json
{
  "name": "업무 관리",
  "short_name": "업무",
  "start_url": "/work/quick-add",
  "display": "standalone"
}
```

---

### 2. 아침 15분 루틴 (자동 추천)

**페이지:** `/work/daily`

**로직:**
1. 오늘 날짜로 기존 Daily Plan 조회
2. 없으면 Tasks DB 필터링:
   - `status = "진행 전"`
   - `dueDate ≤ 오늘`
   - `priorityScore` 높은 순 정렬
   - `weekTheme = 오늘` 가중치 +10
3. 상위 3개 선택 → Daily Plan 생성

**UI:**
- 핵심 3가지 표시 (체크박스)
- 예상 소요 시간 합계
- "작업 완료" 버튼 → Server Action

---

### 3. 주간 리뷰 자동 생성

**Vercel Cron:** 매주 일요일 오전 9시

**생성 내용:**
- 지난 주 Tasks 집계
- 완료율, 업무 영역별 분포
- 총 소요 시간
- 주요 성과 자동 추출

---

### 4. Google Calendar 연동 (선택)

**작업 생성 시 자동 처리:**
1. Notion Tasks DB 생성
2. Google Calendar 이벤트 생성
3. 알림 예약 (1일 전, 1시간 전)

**환경 변수:**
```
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REFRESH_TOKEN=
```

---

## 📂 파일 구조

```
src/
├── types/work.ts                     # 타입 정의
├── lib/work.ts                       # 데이터 페칭 (ISR 캐싱)
├── lib/work-stats.ts                 # 통계 집계 함수
├── lib/calendar.ts                   # Google Calendar API (선택)
├── actions/work.ts                   # Server Actions
└── app/work/
    ├── dashboard/page.tsx            # 대시보드
    ├── tasks/page.tsx                # 할 일 목록
    ├── daily/page.tsx                # 일일 루틴
    ├── weekly/page.tsx               # 주간 리뷰
    ├── team/page.tsx                 # 협업자 관리
    ├── stats/page.tsx                # 통계
    ├── quick-add/page.tsx            # 모바일 빠른 입력 ⭐
    └── _components/                  # 전용 컴포넌트
        ├── task-list.tsx
        ├── task-form.tsx
        ├── daily-plan-card.tsx
        ├── top3-tasks.tsx
        ├── weekly-stats.tsx
        ├── team-member-card.tsx
        └── stats-overview.tsx
```

---

## 🔧 환경 변수 (`.env.local`)

```bash
# 기존 Notion 변수
NOTION_TOKEN=

# 업무 관리 시스템 (6개 신규)
NOTION_DB_TASKS=
NOTION_DB_DAILY_PLANS=
NOTION_DB_WEEKLY_REVIEWS=
NOTION_DB_TEAM=
NOTION_DB_PROJECTS=
NOTION_DB_WORK_AREAS=

# Google Calendar (선택)
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REFRESH_TOKEN=

# Vercel Cron Secret
CRON_SECRET=
```

---

## 📈 ISR 캐싱 전략

- **Tasks 목록**: 10분 (자주 변경)
- **Daily Plan**: 5분 (실시간성 중요)
- **Weekly Review**: 1시간 (주 단위)
- **Work Areas**: 1일 (거의 변경 없음)
- **Team**: 30분 (중간)

---

## 🎯 성공 지표 (KPI)

### 1주 후
- Notion 6개 DB 생성 완료
- `/work/quick-add` 페이지 동작
- 작업 생성/수정/삭제 가능

### 1개월 후
- 일일 루틴 자동 생성
- 주간 리뷰 Cron 작동
- 협업자 작업 할당 시스템 운영
- **시간 절약: 주 8시간** (월 32시간)

### 3개월 후
- 대시보드 KPI 표시
- 통계 차트 동작
- **시간 절약: 주 12시간** (월 48시간)
- **금액 환산: 월 144만원** (시급 3만원 기준)

---

## 🔐 보안 및 권한

### Notion API 권한
- Integration은 연결된 데이터베이스에만 접근 가능
- 읽기/쓰기 권한 분리 설정 가능

### Vercel Cron 인증
- `CRON_SECRET` 환경 변수로 인증
- 외부 접근 차단

### Google Calendar API
- OAuth 2.0 Refresh Token 사용
- Read/Write 권한 최소화

---

## 🚧 알려진 제약

### Notion API
- Rate Limit: 초당 3회 (burst 10회)
- ISR 캐싱으로 대응

### Vercel Cron
- Hobby 플랜: 1일 2회까지 무료
- Pro 플랜: 무제한

### Google Calendar API
- 일일 할당량: 1,000,000 쿼리
- 문제 없음

---

## 📝 다음 단계

### Phase 1: 기본 시스템 (Week 1-4) ✅ 진행 중
1. Notion DB 6개 생성
2. 타입 정의 + 데이터 페칭
3. 모바일 빠른 입력
4. 일일 루틴
5. 주간 리뷰 Cron

### Phase 2: 고도화 (Week 5-8)
1. 대시보드 + 통계
2. 협업자 관리
3. Google Calendar 연동

### Phase 3: AI 비서 (Week 9-10) - 선택
1. 자연어 입력 AI 파싱 (GPT-4o-mini)
2. AI 입력 모드 UI
3. 비용: 월 4,000원

---

## 📚 참고 자료

- [Notion API 공식 문서](https://developers.notion.com/)
- [Next.js App Router](https://nextjs.org/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Google Calendar API](https://developers.google.com/calendar)

---

**작성일:** 2026-02-12
**버전:** 1.0.0
**작성자:** Claude Sonnet 4.5
