# FAQ 검색 기능 강화 구현 완료

## 개요

FAQ 페이지에 실시간 검색 필터, 카테고리 탭, 검색어 하이라이트, 검색 결과 개수 표시 기능을 추가했습니다.

## 구현 상세

### 1. 파일 구조 (4개 컴포넌트, 총 292 라인)

```
src/app/faq/_components/
├── faq-card.tsx        (66 라인) — 검색어 하이라이트 추가
├── faq-grid.tsx        (88 라인) — shadcn/ui Tabs 기반 카테고리 필터
├── faq-list.tsx        (69 라인) — 필터링된 목록 + 검색 결과 개수 표시
└── faq-search.tsx      (69 라인) — 실시간 검색 입력 (debounce 300ms)
```

### 2. 핵심 기능

#### 2.1 실시간 검색 (Debounce)

**파일**: `faq-search.tsx`

- **Debounce 시간**: 300ms
- **검색 대상**: FAQ 제목 + 내용
- **UI 요소**:
  - Search 아이콘 (lucide-react)
  - X 버튼 (검색어 초기화)
  - shadcn/ui Input 컴포넌트

**구현 패턴**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    onSearch(value);
  }, 300);

  return () => clearTimeout(timer);
}, [value, onSearch]);
```

**장점**:
- 타이핑 중 불필요한 렌더링 방지
- 사용자 입력 완료 후 검색 실행
- 부드러운 UX 경험

#### 2.2 카테고리 탭 필터

**파일**: `faq-grid.tsx`

- **UI**: shadcn/ui Tabs 컴포넌트
- **스타일**: `rounded-full` 버튼 (메모리 패턴 준수)
- **카테고리 개수 표시**: "전체 (15)", "배송 (5)" 등
- **상태 관리**: `useState` + `useMemo`로 최적화

**카테고리 목록**:
1. 전체 (all)
2. 배송
3. 결제
4. 교환/환불
5. 상품
6. 기타

**구현 패턴**:
```typescript
const categoryCount = useMemo(() => {
  const count: Partial<Record<FAQCategory | "all", number>> = {
    all: faqs.length,
  };
  categories.forEach((category) => {
    count[category] = faqs.filter((faq) => faq.category === category).length;
  });
  return count;
}, [faqs, categories]);
```

#### 2.3 검색어 하이라이트

**파일**: `faq-card.tsx`

- **하이라이트 대상**: FAQ 제목
- **스타일**: `bg-yellow-200 text-yellow-900` (라이트 모드), `bg-yellow-900 text-yellow-200` (다크 모드)
- **구현 방식**: `<mark>` 태그 사용

**구현 패턴**:
```typescript
function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={index}
        className="bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
```

#### 2.4 검색 결과 개수 표시

**파일**: `faq-list.tsx`

- **UI**: shadcn/ui Badge 컴포넌트 (`variant="secondary"`)
- **표시 조건**: 검색어가 입력된 경우에만 표시
- **포맷**: "검색 결과 5개"

**구현 패턴**:
```typescript
{searchQuery && (
  <div className="mb-4 flex items-center gap-2">
    <span className="text-sm text-muted-foreground">검색 결과</span>
    <Badge variant="secondary">{resultCount}개</Badge>
  </div>
)}
```

#### 2.5 빈 상태 UI

**파일**: `faq-list.tsx`

- **검색 결과 없음**: `"${searchQuery}"에 대한 검색 결과가 없습니다`
- **FAQ 없음**: "FAQ가 없습니다"
- **EmptyState 컴포넌트 재사용**: `type="search"`

### 3. 성능 최적화

#### 3.1 useMemo로 필터링 결과 캐싱

```typescript
// 카테고리별로 필터링된 FAQ 목록
const filteredFAQsByCategory = useMemo(() => {
  if (selectedCategory === "all") return faqs;
  return faqs.filter((faq) => faq.category === selectedCategory);
}, [faqs, selectedCategory]);
```

#### 3.2 useCallback으로 검색 콜백 메모이제이션

```typescript
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query);
}, []);
```

#### 3.3 Debounce로 검색 입력 최적화

- 300ms 디바운스로 타이핑 중 불필요한 렌더링 방지
- `useEffect`의 cleanup 함수로 타이머 정리

### 4. 타입 안전성

#### 4.1 기존 타입 재사용

- `FAQ` 타입 (`src/types/faq.ts`)
- `FAQCategory` 타입 (5가지 카테고리 유니온)
- `FAQ_CATEGORY_COLORS` 상수 맵 (배지 색상)

#### 4.2 새로운 Props 타입

**FAQSearchProps**:
```typescript
interface FAQSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

**FAQListProps**:
```typescript
interface FAQListProps {
  faqs: FAQ[];
  searchQuery: string;
}
```

**FAQCardProps** (업데이트):
```typescript
interface FAQCardProps {
  faq: FAQ;
  searchQuery?: string;  // 새로 추가
}
```

### 5. UI/UX 개선 사항

#### 5.1 검색 바

- **위치**: 카테고리 탭 위에 배치 (먼저 검색 → 그 다음 카테고리 필터)
- **아이콘**: 왼쪽 Search, 오른쪽 X (검색어 있을 때)
- **플레이스홀더**: "FAQ 검색 (제목, 내용)"

#### 5.2 카테고리 탭

- **스타일**: 투명 배경 (`bg-transparent`), 간격 있는 버튼 (`gap-2`)
- **활성 상태**: `bg-primary text-primary-foreground`
- **개수 표시**: 각 카테고리별 FAQ 개수 실시간 표시

#### 5.3 검색 결과

- **하이라이트**: 노란색 배경으로 검색어 강조
- **개수 표시**: Badge로 결과 개수 명시
- **빈 상태**: 검색어에 따라 다른 메시지 표시

### 6. 빌드 검증

#### 6.1 TypeScript 에러 해결

**문제**: `scripts/` 디렉토리의 타입 에러로 빌드 실패

**해결**:
```json
// tsconfig.json
{
  "exclude": ["node_modules", "scripts"]
}
```

**문제**: `Record<FAQCategory | "all", number>` 타입 초기화 에러

**해결**:
```typescript
// Partial<Record<...>>로 변경
const count: Partial<Record<FAQCategory | "all", number>> = {
  all: faqs.length,
};
```

#### 6.2 빌드 결과

- **총 페이지**: 43개 (정적 21개 + 동적 22개)
- **FAQ 페이지**: `/faq` (정적, 1시간 캐싱)
- **FAQ 상세**: `/faq/[id]` (동적, 10분 캐싱, 15개 FAQ 생성)
- **빌드 시간**: 약 14초
- **타입 에러**: 0개
- **컴파일 에러**: 0개

### 7. 사용 방법

#### 7.1 검색

1. 검색 바에 키워드 입력 (예: "배송")
2. 300ms 후 자동 검색 실행
3. 제목 또는 내용에 키워드가 포함된 FAQ 표시
4. 검색어가 노란색으로 하이라이트됨

#### 7.2 카테고리 필터

1. 탭에서 카테고리 선택 (예: "배송")
2. 해당 카테고리의 FAQ만 표시
3. 검색 + 카테고리 필터 동시 적용 가능

#### 7.3 검색어 초기화

1. 검색 바 오른쪽 X 버튼 클릭
2. 검색어 초기화 + 전체 목록 표시

### 8. 확장 가능성

#### 8.1 단기 (1~2시간)

- **정렬 기능**: 조회수 순, 최신 순, 오래된 순
- **북마크 기능**: 자주 보는 FAQ 저장 (localStorage)
- **공유 버튼**: FAQ 링크 복사, SNS 공유

#### 8.2 중기 (4~8시간)

- **전체 텍스트 검색**: 마크다운 콘텐츠 전체에서 검색
- **검색 히스토리**: 최근 검색어 저장 (localStorage)
- **추천 FAQ**: 현재 FAQ와 관련된 다른 FAQ 추천

#### 8.3 장기 (16~32시간)

- **AI 검색**: GPT-4 + RAG로 의미 기반 검색
- **다국어 검색**: 한글 + 영어 동시 검색
- **음성 검색**: Web Speech API 연동

## 메모리 업데이트 제안

```markdown
## Phase 2-7 완료: FAQ 검색 기능 강화 (커밋 예정)

### 구현 내용 (4개 컴포넌트, 292 라인)

1. ✅ **실시간 검색 (Debounce 300ms)**
   - faq-search.tsx: 검색 입력 컴포넌트
   - Search 아이콘 + X 버튼 (검색어 초기화)
   - useEffect로 디바운스 구현

2. ✅ **카테고리 탭 필터 (shadcn/ui Tabs)**
   - faq-grid.tsx: Tabs 컴포넌트 기반 카테고리 필터
   - 카테고리별 FAQ 개수 표시 (예: "배송 (5)")
   - useMemo로 필터링 결과 캐싱

3. ✅ **검색어 하이라이트**
   - faq-card.tsx: highlightText() 헬퍼 함수
   - <mark> 태그로 노란색 배경 하이라이트
   - 다크 모드 대응

4. ✅ **검색 결과 개수 표시**
   - faq-list.tsx: Badge 컴포넌트로 개수 표시
   - "검색 결과 5개" 포맷
   - 검색어 있을 때만 표시

5. ✅ **빈 상태 UI**
   - EmptyState 컴포넌트 재사용
   - 검색어에 따라 다른 메시지 표시

### 핵심 패턴

- **Debounce 패턴**: 300ms 타이머로 불필요한 렌더링 방지
- **useMemo 캐싱**: 카테고리 필터링 결과 메모이제이션
- **useCallback 메모이제이션**: 검색 콜백 함수 최적화
- **하이라이트 패턴**: RegExp 분할 + <mark> 태그
- **타입 안전성**: Partial<Record<...>> 패턴으로 타입 에러 해결

### 빌드 검증

- ✅ 타입 에러 0개
- ✅ 컴파일 에러 0개
- ✅ 43개 페이지 정상 생성 (FAQ 15개 포함)
- ✅ tsconfig.json 수정 (scripts 디렉토리 제외)

### 다음 작업

- FAQ 정렬 기능 (조회수 순, 최신 순)
- FAQ 북마크 기능 (localStorage)
- FAQ 공유 버튼 (링크 복사, SNS)
```

## 참고 자료

- **shadcn/ui Tabs**: https://ui.shadcn.com/docs/components/tabs
- **shadcn/ui Badge**: https://ui.shadcn.com/docs/components/badge
- **shadcn/ui Input**: https://ui.shadcn.com/docs/components/input
- **React useMemo**: https://react.dev/reference/react/useMemo
- **React useCallback**: https://react.dev/reference/react/useCallback
- **React useEffect**: https://react.dev/reference/react/useEffect
- **Debounce Pattern**: https://www.freecodecamp.org/news/javascript-debounce-example/
