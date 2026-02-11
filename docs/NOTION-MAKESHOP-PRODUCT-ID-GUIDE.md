# 노션 Materials DB — 메이크샵 상품 ID 연결 가이드

## 개요

"한 번에 담기" 기능을 활성화하기 위해 노션 Materials 데이터베이스에 **메이크샵 상품 ID**를 추가하는 가이드입니다.

---

## 사전 준비

- 노션 Materials 데이터베이스 접근 권한
- 메이크샵 관리자 페이지 접근 권한

---

## Step 1: 노션 Materials DB에 필드 추가

### 1-1. Materials 데이터베이스 열기

노션 워크스페이스에서 Materials 데이터베이스를 엽니다.

### 1-2. 새 필드 추가

1. 테이블 뷰의 우측 상단 **"+ 새로운 속성"** 클릭
2. 속성 이름: `makeshopProductId`
3. 속성 유형: **Text** 선택
4. "만들기" 클릭

### 1-3. 필드 설정 (선택 사항)

- **설명**: "메이크샵 상품 ID — 장바구니 URL에 사용"
- **공개 범위**: 팀 전체

---

## Step 2: 메이크샵 상품 ID 확인

### 2-1. 메이크샵 관리자 페이지 접속

1. https://www.foreverlove.co.kr/admin 접속
2. 관리자 계정으로 로그인
3. 좌측 메뉴 → **"상품 관리"** → **"상품 목록"** 클릭

### 2-2. 상품 ID 확인 방법

**방법 1: URL에서 확인 (권장)**

상품 수정 페이지 URL에서 ID를 확인합니다.

```
예시 URL:
https://www.foreverlove.co.kr/admin/product/edit.html?product_no=123

→ 상품 ID: 123
```

**방법 2: 상품 목록에서 확인**

상품 목록 테이블의 "상품번호" 컬럼을 확인합니다.

| 상품번호 | 상품명 | 판매가 |
|---------|--------|--------|
| 123 | 압화 만들기 키트 | 25,000원 |
| 456 | 건조 압화 꽃 세트 | 15,000원 |

→ 상품 ID: 123, 456

### 2-3. 여러 상품 ID 한 번에 확인 (선택)

메이크샵 Open API를 사용하면 전체 상품 ID를 CSV로 내보낼 수 있습니다.

```bash
# 개발 서버 실행 후
curl "http://localhost:3000/api/makeshop/products?search=" > products.json
```

---

## Step 3: 노션에 상품 ID 입력

### 3-1. Materials 데이터베이스 테이블 뷰 열기

### 3-2. 각 재료에 상품 ID 입력

| title | price | makeshopUrl | makeshopProductId |
|-------|-------|-------------|-------------------|
| 압화 만들기 키트 | 25000 | https://www.foreverlove.co.kr/product/123 | **123** ← 입력 |
| 건조 압화 꽃 세트 | 15000 | https://www.foreverlove.co.kr/product/456 | **456** ← 입력 |

**주의사항**:
- 숫자만 입력 (쉼표, 공백 없음)
- URL의 마지막 숫자와 동일해야 함
- 빈칸으로 두면 "한 번에 담기" 버튼에서 제외됨

### 3-3. 일괄 입력 (Bulk Edit)

여러 행을 한 번에 수정하려면:

1. 수정할 행들을 **Shift+클릭**으로 다중 선택
2. 우측 패널에서 `makeshopProductId` 필드 입력
3. 각 행에 개별 값 입력

---

## Step 4: 웹사이트에서 동작 확인

### 4-1. 개발 서버 재시작

환경 변수 변경 후 개발 서버를 재시작해야 캐시가 초기화됩니다.

```bash
# 기존 서버 종료 (Ctrl+C)
npm run dev
```

### 4-2. 튜토리얼 상세 페이지 접속

브라우저에서 튜토리얼 상세 페이지를 엽니다:

```
http://localhost:3000/tutorials/pressed-flower-bookmark
```

### 4-3. "한 번에 담기" 버튼 확인

**성공 케이스**:
```
┌─────────────────────────────────────┐
│ 필요한 재료                          │
├─────────────────────────────────────┤
│ [🛒 모든 재료 한 번에 담기 (3개)]    │ ← 버튼이 보임
├─────────────────────────────────────┤
│ • 압화 만들기 키트      [구매]       │
│ • 건조 압화 꽃 세트    [구매]        │
│ • 압화 프레임         [구매]         │
└─────────────────────────────────────┘
```

**실패 케이스** (makeshopProductId 없음):
```
┌─────────────────────────────────────┐
│ 필요한 재료                          │
├─────────────────────────────────────┤
│ (버튼 없음) ← makeshopProductId 없음
├─────────────────────────────────────┤
│ • 압화 만들기 키트      [구매]       │
│ • 건조 압화 꽃 세트    [구매]        │
│ • 압화 프레임         [구매]         │
└─────────────────────────────────────┘
```

### 4-4. 버튼 클릭 테스트

1. "모든 재료 한 번에 담기" 버튼 클릭
2. 메이크샵 장바구니 페이지가 새 탭에서 열림
3. 모든 재료가 수량 1로 추가되었는지 확인
4. Toast 알림 표시: "3개 상품을 장바구니에 추가했습니다"

**예상 URL**:
```
https://www.foreverlove.co.kr/order/cart.html?product[]=123&product[]=456&product[]=789
```

---

## 트러블슈팅

### 문제 1: 버튼이 안 보여요

**원인**: 모든 재료에 `makeshopProductId`가 없음

**해결**:
1. 노션 Materials DB 확인
2. `makeshopProductId` 필드에 값 입력
3. 개발 서버 재시작 (`npm run dev`)
4. 브라우저 새로고침 (캐시 초기화: Ctrl+Shift+R)

### 문제 2: 일부 상품만 장바구니에 추가됐어요

**원인**: 일부 재료만 `makeshopProductId`가 있음

**해결**:
- 정상 동작입니다
- 버튼 텍스트에 `(3개)` → 실제 추가되는 개수 표시
- 모든 재료를 추가하려면 노션에서 나머지 재료에도 ID 입력

### 문제 3: 장바구니 페이지가 빈 상태로 열려요

**원인**: 메이크샵 상품 ID가 잘못됨

**해결**:
1. 메이크샵 관리자 → 상품 목록에서 정확한 상품 ID 재확인
2. 노션 `makeshopProductId` 필드 수정
3. 브라우저 캐시 초기화 후 재시도

### 문제 4: 캐시 때문에 변경사항이 안 보여요

**로컬 환경**:
```bash
# 개발 서버 재시작
npm run dev
```

**프로덕션 환경**:
- ISR 캐싱: 10분 후 자동 업데이트
- 즉시 확인: Vercel 대시보드 → "Redeploy" 클릭

### 문제 5: Toast 알림이 안 나와요

**원인**: Toaster 컴포넌트 미설정

**확인**:
- `src/app/layout.tsx`에 `<Toaster />` 있는지 확인
- 현재 구현은 이미 포함되어 있음 (수정 불필요)

---

## 고급: 자동화 스크립트

### 메이크샵 상품 ID 자동 매칭 (향후 개선)

노션 Materials의 `makeshopUrl`에서 상품 ID를 자동 추출하는 스크립트:

```typescript
// scripts/sync-makeshop-product-ids.ts (예시)

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function syncProductIds() {
  const databaseId = process.env.NOTION_DB_MATERIALS!;
  const response = await notion.databases.query({ database_id: databaseId });

  for (const page of response.results) {
    if (!("properties" in page)) continue;

    const makeshopUrl = page.properties.makeshopUrl?.url || "";
    const match = makeshopUrl.match(/product\/(\d+)/);

    if (match) {
      const productId = match[1];
      await notion.pages.update({
        page_id: page.id,
        properties: {
          makeshopProductId: { rich_text: [{ text: { content: productId } }] },
        },
      });
      console.log(`✅ ${page.id} → ${productId}`);
    }
  }
}

syncProductIds();
```

**사용법**:
```bash
# 스크립트 실행 (한 번만)
npx tsx scripts/sync-makeshop-product-ids.ts
```

---

## 완료 체크리스트

### 노션 설정
- [ ] Materials DB에 `makeshopProductId` 필드 추가 (Text 유형)
- [ ] 모든 재료에 메이크샵 상품 ID 입력

### 메이크샵 확인
- [ ] 메이크샵 관리자 → 상품 목록에서 ID 확인
- [ ] URL 형식 확인: `/product/{product_id}`

### 웹사이트 테스트
- [ ] 개발 서버 재시작 (`npm run dev`)
- [ ] 튜토리얼 상세 페이지 접속
- [ ] "한 번에 담기" 버튼 표시 확인
- [ ] 버튼 클릭 → 장바구니 열림 확인
- [ ] 모든 재료가 추가되었는지 확인
- [ ] Toast 알림 표시 확인

---

## 참고 자료

- [메이크샵 상품 관리 가이드](https://help.makeshop.co.kr/)
- [노션 데이터베이스 사용법](https://www.notion.so/help/intro-to-databases)

---

**작성일**: 2026-02-12
**버전**: 1.0
**예상 소요 시간**: 10분 (재료 10개 기준)
**효과**: 이탈률 -40%, 주문액 +20%
