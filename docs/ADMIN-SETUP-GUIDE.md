# Admin 페이지 설정 가이드

## 개요

Admin 페이지는 고객 매출 관리 시스템으로, Notion을 데이터베이스로 사용하여 고객 정보와 주문 내역을 관리합니다.

---

## 페이지 구조

### 1. 대시보드 (`/admin/dashboard`)
- **통계 카드**: 총 매출, 총 주문 수, 총 고객 수, 평균 주문 금액
- **일별 매출 차트**: 최근 30일간의 매출 추이 (Recharts)
- **상위 고객 Top 5**: 구매 금액 기준
- **인기 상품 Top 5**: 판매 수량 기준

### 2. 고객 목록 (`/admin/customers`)
- **검색**: 이름, 전화번호, 이메일, 회사명
- **필터**: 고객 타입 (B2C, B2B), 등급 (일반, VIP, VVIP)
- **테이블**: 8개 컬럼 (이름, 연락처, 타입, 등급, 총 주문, 총 구매 금액, 최근 주문일, 상세)
- **페이지네이션**: 기본 지원 (현재 전체 표시)

### 3. 고객 상세 (`/admin/customers/[id]`)
- **고객 정보 카드**: 전화번호, 이메일, 주소, 회사명
- **통계 정보**: 고객 유형, 등급, 총 주문 수, 총 구매 금액, 최근 주문일
- **메모**: 고객별 특이사항
- **주문 내역 테이블**: 주문번호, 주문일, 금액, 결제 수단, 상태

---

## Notion 데이터베이스 스키마

### Customers DB

| 속성명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| Name | Title | ✅ | 고객명 |
| Phone | Phone Number | ✅ | 전화번호 (010-0000-0000) |
| Email | Email | ✅ | 이메일 |
| Address | Rich Text | | 주소 |
| Company | Rich Text | | 회사/단체명 |
| Type | Select | ✅ | B2C 또는 B2B |
| Grade | Select | ✅ | 일반, VIP, VVIP |
| Notes | Rich Text | | 메모 |
| Created | Created Time | 자동 | 등록일 |

**Type 옵션**:
- `B2C`: 개인 고객 (파란색)
- `B2B`: 기업/단체 고객 (청록색)

**Grade 옵션**:
- `일반`: 일반 고객 (회색)
- `VIP`: VIP 고객 (보라색)
- `VVIP`: VVIP 고객 (분홍색)

### Orders DB

| 속성명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| Order Number | Title | ✅ | 주문번호 (YYYYMMDD-XXX) |
| Customer | Relation | ✅ | Customers DB 연결 |
| Order Date | Date | ✅ | 주문일 |
| Total Amount | Number | ✅ | 총 금액 (원) |
| Payment Method | Select | ✅ | 결제 수단 |
| Status | Select | ✅ | 주문 상태 |
| Items | Rich Text | | 주문 상품 목록 (JSON) |
| Created | Created Time | 자동 | 등록일 |

**Payment Method 옵션**:
- `카드`: 신용카드/체크카드
- `계좌이체`: 무통장 입금
- `현금`: 현금 결제
- `기타`: 기타 결제 수단

**Status 옵션**:
- `결제 대기`: 주문 생성, 결제 전 (회색)
- `결제 완료`: 결제 완료, 배송 전 (파란색)
- `배송 중`: 배송 진행 중 (주황색)
- `배송 완료`: 배송 완료 (녹색)
- `취소`: 주문 취소 (빨간색)
- `환불`: 환불 처리 (빨간색)

---

## 환경 변수 설정

### 필수 환경 변수

`.env.local` 파일에 다음 변수를 추가합니다:

```bash
# ── 고객 매출 관리 ──
NOTION_DB_CUSTOMERS=여기에_Customers_DB_ID
NOTION_DB_ORDERS=여기에_Orders_DB_ID
```

### DB ID 확인 방법

[Notion Integration 연결 가이드](./NOTION-INTEGRATION-GUIDE.md#4단계-데이터베이스-id-확인) 참조

---

## 샘플 데이터 생성

### Customers DB 샘플 (5명)

#### 1. 박서현 (B2B VVIP)
- **Name**: 박서현
- **Phone**: 010-3456-7890
- **Email**: park.seohyun@example.com
- **Address**: 경기도 성남시 분당구 정자로 789
- **Company**: 꽃사랑 플라워샵
- **Type**: B2B
- **Grade**: VVIP
- **Notes**: 월 1회 정기 주문, 도매가 적용

#### 2. 정민호 (B2B VIP)
- **Name**: 정민호
- **Phone**: 010-5678-9012
- **Email**: jung.minho@company.com
- **Address**: 서울시 강남구 테헤란로 123
- **Company**: 행복복지센터
- **Type**: B2B
- **Grade**: VIP
- **Notes**: 분기별 행사용 대량 주문

#### 3. 김미영 (B2C VIP)
- **Name**: 김미영
- **Phone**: 010-1234-5678
- **Email**: kim.miyoung@example.com
- **Address**: 서울시 송파구 올림픽로 456
- **Company**: (비워둠)
- **Type**: B2C
- **Grade**: VIP
- **Notes**: 취미 활동, 워크샵 자주 참여

#### 4. 이지훈 (B2C 일반)
- **Name**: 이지훈
- **Phone**: 010-2345-6789
- **Email**: lee.jihoon@example.com
- **Address**: 인천시 남동구 예술로 234
- **Company**: (비워둠)
- **Type**: B2C
- **Grade**: 일반
- **Notes**: 처음 압화 시작

#### 5. 최수진 (B2C 일반)
- **Name**: 최수진
- **Phone**: 010-4567-8901
- **Email**: choi.sujin@example.com
- **Address**: 경기도 수원시 영통구 광교로 567
- **Company**: (비워둠)
- **Type**: B2C
- **Grade**: 일반
- **Notes**: (비워둠)

### Orders DB 샘플 (10건)

#### 박서현 고객 주문 (2건)

**주문 1**:
- **Order Number**: 20260210-001
- **Customer**: 박서현 (Relation)
- **Order Date**: 2026-02-10
- **Total Amount**: 120000
- **Payment Method**: 계좌이체
- **Status**: 배송 중
- **Items**: 압화 DIY 키트 (대) x 10개

**주문 2**:
- **Order Number**: 20260211-001
- **Customer**: 박서현 (Relation)
- **Order Date**: 2026-02-11
- **Total Amount**: 120000
- **Payment Method**: 계좌이체
- **Status**: 결제 완료
- **Items**: 압화 재료 세트 (혼합) x 15개

#### 정민호 고객 주문 (2건)

**주문 1**:
- **Order Number**: 20260209-001
- **Customer**: 정민호
- **Order Date**: 2026-02-09
- **Total Amount**: 360000
- **Payment Method**: 계좌이체
- **Status**: 배송 완료
- **Items**: 압화 체험 키트 (20인용) x 2개

**주문 2**:
- **Order Number**: 20260209-002
- **Customer**: 정민호
- **Order Date**: 2026-02-09
- **Total Amount**: 360000
- **Payment Method**: 카드
- **Status**: 배송 완료
- **Items**: 압화 북마크 x 30개

#### 김미영 고객 주문 (2건)

**주문 1**:
- **Order Number**: 20260208-001
- **Customer**: 김미영
- **Order Date**: 2026-02-08
- **Total Amount**: 85000
- **Payment Method**: 카드
- **Status**: 배송 완료
- **Items**: 압화 엽서 x 5개

**주문 2**:
- **Order Number**: 20260208-002
- **Customer**: 김미영
- **Order Date**: 2026-02-08
- **Total Amount**: 120000
- **Payment Method**: 카드
- **Status**: 배송 완료
- **Items**: 압화 DIY 키트 (대) x 10개

#### 이지훈 고객 주문 (2건)

**주문 1**:
- **Order Number**: 20260205-001
- **Customer**: 이지훈
- **Order Date**: 2026-02-05
- **Total Amount**: 80000
- **Payment Method**: 카드
- **Status**: 배송 완료
- **Items**: (비워둠)

**주문 2**:
- **Order Number**: 20260205-002
- **Customer**: 이지훈
- **Order Date**: 2026-02-05
- **Total Amount**: 40000
- **Payment Method**: 현금
- **Status**: 배송 완료
- **Items**: (비워둠)

#### 최수진 고객 주문 (2건)

**주문 1**:
- **Order Number**: 20260128-001
- **Customer**: 최수진
- **Order Date**: 2026-01-28
- **Total Amount**: 25000
- **Payment Method**: 카드
- **Status**: 배송 완료
- **Items**: (비워둠)

**주문 2**:
- **Order Number**: 20260128-002
- **Customer**: 최수진
- **Order Date**: 2026-01-28
- **Total Amount**: 20000
- **Payment Method**: 카드
- **Status**: 배송 완료
- **Items**: (비워둠)

---

## 데이터 조회 로직

### 통계 계산 (`src/lib/sales-stats.ts`)

#### `calculateSalesStats(customers, orders)`

**입력**:
- `customers`: Customer[] - 고객 목록
- `orders`: Order[] - 주문 목록

**출력**:
- `totalSales`: number - 총 매출
- `totalOrders`: number - 총 주문 수
- `totalCustomers`: number - 총 고객 수
- `averageOrderValue`: number - 평균 주문 금액
- `dailySales`: DailySales[] - 일별 매출 (최근 30일)
- `topCustomers`: TopCustomer[] - 상위 고객 Top 5
- `topProducts`: TopProduct[] - 인기 상품 Top 5

#### `getDailySales(orders, days = 30)`

최근 N일간의 일별 매출 데이터를 생성합니다.

**로직**:
1. 현재 날짜에서 N일 전까지 날짜 배열 생성
2. 각 날짜별로 주문을 필터링하여 합계 계산
3. `{ date: string, amount: number }` 형식으로 반환

#### `getTopCustomers(customers, orders, limit = 5)`

구매 금액 기준 상위 고객을 반환합니다.

**로직**:
1. 각 고객별 총 주문 수와 총 구매 금액 계산
2. 구매 금액 내림차순 정렬
3. 상위 N명 반환

#### `getTopProducts(orders, limit = 5)`

판매 수량 기준 인기 상품을 반환합니다.

**로직**:
1. 모든 주문의 `Items` 필드 파싱 (JSON 또는 텍스트)
2. 상품별 판매 수량과 총 금액 집계
3. 판매 수량 내림차순 정렬
4. 상위 N개 반환

---

## 컴포넌트 구조

### Server Components

- `src/app/admin/layout.tsx` - Admin 레이아웃 + 네비게이션
- `src/app/admin/dashboard/page.tsx` - 대시보드 페이지
- `src/app/admin/customers/page.tsx` - 고객 목록 페이지
- `src/app/admin/customers/[id]/page.tsx` - 고객 상세 페이지

### Client Components

**대시보드**:
- `src/app/admin/dashboard/_components/sales-overview.tsx` - 통계 카드 (4개)
- `src/app/admin/dashboard/_components/sales-chart.tsx` - 일별 매출 차트 (Recharts)
- `src/app/admin/dashboard/_components/top-customers.tsx` - 상위 고객 Top 5
- `src/app/admin/dashboard/_components/top-products.tsx` - 인기 상품 Top 5

**고객 목록**:
- `src/app/admin/customers/_components/customer-table.tsx` - 고객 테이블 + 검색/필터

**고객 상세**:
- `src/app/admin/customers/_components/customer-detail.tsx` - 고객 정보 카드
- `src/app/admin/customers/_components/customer-orders.tsx` - 주문 내역 테이블

---

## 스타일링

### 색상 시스템

**고객 타입**:
- B2C: `bg-blue-500/10 text-blue-700` (파란색)
- B2B: `bg-cyan-500/10 text-cyan-700` (청록색)

**고객 등급**:
- 일반: `bg-gray-500/10 text-gray-700` (회색)
- VIP: `bg-purple-500/10 text-purple-700` (보라색)
- VVIP: `bg-pink-500/10 text-pink-700` (분홍색)

**주문 상태**:
- 결제 대기: `bg-gray-500/10 text-gray-700` (회색)
- 결제 완료: `bg-blue-500/10 text-blue-700` (파란색)
- 배송 중: `bg-orange-500/10 text-orange-700` (주황색)
- 배송 완료: `bg-green-500/10 text-green-700` (녹색)
- 취소/환불: `bg-red-500/10 text-red-700` (빨간색)

**통계 카드 아이콘**:
- 총 매출: DollarSign (녹색 배경)
- 총 주문 수: ShoppingCart (파란색 배경)
- 총 고객 수: Users (보라색 배경)
- 평균 주문 금액: TrendingUp (주황색 배경)

---

## 접근 제어

### 현재 구현

Admin 페이지는 **별도 인증 없이 접근 가능**합니다.

### 향후 개선 사항

1. **기본 인증 (Basic Auth)**
   - Next.js Middleware에서 HTTP Basic Auth 구현
   - 환경 변수로 사용자명/비밀번호 관리

2. **OAuth 인증**
   - NextAuth.js 사용
   - Google, GitHub 등 OAuth 제공자 연동

3. **노션 권한 활용**
   - Notion API의 사용자 권한 체크
   - Integration이 연결된 워크스페이스 멤버만 접근

---

## 배포 시 주의사항

### 환경 변수

Vercel 등 배포 플랫폼에서 다음 환경 변수를 설정해야 합니다:

```
NOTION_TOKEN=ntn_여기에_토큰
NOTION_DB_CUSTOMERS=여기에_Customers_DB_ID
NOTION_DB_ORDERS=여기에_Orders_DB_ID
```

### ISR 캐시 시간

- 목록 페이지 (`/admin/dashboard`, `/admin/customers`): **1시간** (`revalidate: 3600`)
- 상세 페이지 (`/admin/customers/[id]`): **10분** (`revalidate: 600`)

데이터 변경 후 즉시 반영이 필요하면:
1. Vercel 대시보드에서 캐시 클리어
2. 또는 On-Demand Revalidation 구현

---

## 성능 최적화

### 1. 병렬 조회

대시보드에서 Customers와 Orders를 병렬로 조회:

```typescript
const [customers, orders] = await Promise.all([
  getCustomers(),
  getOrders(),
]);
```

### 2. 캐싱

Notion API 함수에 `unstable_cache` 적용:

```typescript
export const getCustomers = unstable_cache(
  async () => { /* ... */ },
  ['customers'],
  { revalidate: 3600, tags: ['customers'] }
);
```

### 3. 선택적 필드 조회

필요한 속성만 조회하여 응답 크기 최소화:

```typescript
const response = await notion.databases.query({
  database_id: customersDbId,
  // filter_properties를 사용하여 특정 속성만 조회 (현재 미구현)
});
```

---

## 문제 해결

### 데이터가 표시되지 않음

[Notion Integration 연결 가이드 - 문제 해결](./NOTION-INTEGRATION-GUIDE.md#문제-해결) 참조

### Relation 데이터 조회 실패

**증상**: 고객 상세 페이지에서 주문 내역이 표시되지 않음

**원인**: Orders DB의 Customer relation이 설정되지 않음

**해결 방법**:
1. 노션에서 Orders DB 열기
2. "Customer" 속성이 Relation 타입인지 확인
3. Relation 대상이 Customers DB인지 확인
4. 각 주문에 고객이 올바르게 연결되어 있는지 확인

### 차트가 렌더링되지 않음

**증상**: 대시보드에서 "데이터가 없습니다" 메시지 표시

**원인**: 최근 30일 이내의 주문 데이터가 없음

**해결 방법**:
1. 노션에서 Orders DB 열기
2. "Order Date" 속성에 최근 날짜 입력 (2026-02-01 이후)
3. 페이지 새로고침

---

## 향후 개선 사항

### 기능

1. **주문 관리 페이지** (`/admin/orders`)
   - 주문 목록 테이블
   - 주문 상세 페이지
   - 상태 변경 기능

2. **통계 필터**
   - 기간 선택 (일/주/월/년)
   - 고객 타입별 필터
   - CSV 내보내기

3. **실시간 알림**
   - 신규 주문 알림
   - 배송 상태 변경 알림
   - 고객 문의 알림

### UI/UX

1. **다크 모드**
   - 이미 구현된 테마 전환 기능 활용

2. **반응형 개선**
   - 모바일 환경 최적화
   - 터치 제스처 지원

3. **접근성**
   - ARIA 레이블 추가
   - 키보드 네비게이션 개선

---

## 참고 자료

- [Notion Integration 연결 가이드](./NOTION-INTEGRATION-GUIDE.md)
- [Recharts 공식 문서](https://recharts.org/)
- [shadcn/ui 공식 문서](https://ui.shadcn.com/)

---

## 마지막 업데이트
- 날짜: 2026-02-11
- 버전: 1.0.0
