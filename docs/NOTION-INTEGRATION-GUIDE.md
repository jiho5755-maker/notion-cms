# Notion Integration 연결 가이드

## 개요

이 프로젝트는 Notion Official SDK를 사용하여 Notion을 CMS로 활용합니다. Notion Integration을 생성하고 데이터베이스에 연결하는 방법을 설명합니다.

---

## 1단계: Notion Integration 생성

### 1.1 Integration 생성

1. **Notion Integrations 페이지 접속**
   - URL: https://www.notion.so/my-integrations
   - 노션 계정으로 로그인

2. **New integration 클릭**

3. **Integration 정보 입력**
   - **Type**: Internal (내부용)
   - **Name**: `PRESSCO 21` (또는 원하는 이름)
   - **Associated workspace**: 현재 워크스페이스 선택
   - **Logo**: 선택사항

4. **Create 클릭**

### 1.2 Integration Token 복사

1. Integration 생성 후 자동으로 표시되는 **Token** 복사
2. 또는 Integration 페이지에서 **"Show"** 버튼 클릭하여 Token 확인

**Token 형식 예시**:
```
ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ 주의**: Token은 비밀번호와 같습니다! 절대 공유하거나 Git에 커밋하지 마세요.

---

## 2단계: 환경 변수 설정

### 2.1 .env.local 파일 생성

프로젝트 루트 디렉토리에서:

```bash
cp .env.example .env.local
```

### 2.2 NOTION_TOKEN 설정

`.env.local` 파일을 열고 Token을 붙여넣습니다:

```bash
NOTION_TOKEN=ntn_여기에_복사한_토큰_붙여넣기
```

**예시**:
```bash
NOTION_TOKEN=ntn_YOUR_TOKEN_HERE_XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 3단계: 데이터베이스에 Integration 연결

### 3.1 연결이 필요한 데이터베이스

다음 7개 데이터베이스를 모두 Integration에 연결해야 합니다:

| 데이터베이스 | 용도 | 환경 변수 |
|--------------|------|-----------|
| Tutorials | 튜토리얼 콘텐츠 | `NOTION_DB_TUTORIALS` |
| Materials | 재료/상품 정보 | `NOTION_DB_MATERIALS` |
| Combos | 재료 조합 가이드 | `NOTION_DB_COMBOS` |
| Seasons | 시즌 캠페인 | `NOTION_DB_SEASONS` |
| Categories | 분류 체계 | `NOTION_DB_CATEGORIES` |
| **Customers** | **고객 정보** | `NOTION_DB_CUSTOMERS` |
| **Orders** | **주문 내역** | `NOTION_DB_ORDERS` |

### 3.2 연결 방법

각 데이터베이스마다 다음 과정을 반복합니다:

1. **노션에서 데이터베이스 페이지 열기**

2. **우측 상단 `•••` (더보기) 클릭**

3. **"연결" 또는 "Add connections" 선택**

4. **생성한 Integration 선택**
   - 예: "PRESSCO 21"

5. **"확인" 또는 "Confirm" 클릭**

6. **연결 상태 확인**
   - 페이지 상단에 Integration 아이콘이 표시되면 성공

### 3.3 연결 상태 시각적 확인

연결이 완료되면 데이터베이스 페이지 상단에 다음과 같이 표시됩니다:

```
🔗 PRESSCO 21  (또는 설정한 Integration 이름)
```

---

## 4단계: 데이터베이스 ID 확인

### 4.1 방법 1: 노션 URL에서 추출 (수동)

1. 노션에서 데이터베이스 페이지 열기
2. 브라우저 주소창 URL 확인:
   ```
   https://www.notion.so/74ce38d4290b402ca4cd5bf02a55119e?v=...
   ```
3. URL에서 32자리 ID 복사 (하이픈 없음)
4. `.env.local`에 입력 시 하이픈 추가:
   ```
   74ce38d4-290b-402c-a4cd-5bf02a55119e
   ```

**하이픈 위치**:
```
74ce38d4-290b-402c-a4cd-5bf02a55119e
        ^    ^    ^    ^
        8    4    4    4
```

### 4.2 방법 2: 스크립트 사용 (자동, 권장)

프로젝트 루트 디렉토리에 다음 스크립트를 생성합니다:

**`check-integration.mjs`**:
```javascript
import { Client } from '@notionhq/client';

const token = process.env.NOTION_TOKEN;
const notion = new Client({ auth: token });

async function checkAccess() {
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'database' },
      page_size: 100,
    });

    console.log('✅ Integration이 접근할 수 있는 데이터베이스:');
    console.log('총', response.results.length, '개\n');

    response.results.forEach((db, index) => {
      console.log(`${index + 1}. ${db.title[0]?.plain_text || '(제목 없음)'}`);
      console.log(`   ID: ${db.id}`);
      console.log(`   URL: https://www.notion.so/${db.id.replace(/-/g, '')}\n`);
    });

    if (response.results.length === 0) {
      console.log('⚠️  Integration에 연결된 데이터베이스가 없습니다.');
    }
  } catch (error) {
    console.log('❌ 오류:', error.message);
  }
}

checkAccess();
```

**실행**:
```bash
node --env-file=.env.local check-integration.mjs
```

**출력 예시**:
```
✅ Integration이 접근할 수 있는 데이터베이스:
총 7 개

1. Customers
   ID: 74ce38d4-290b-402c-a4cd-5bf02a55119e
   URL: https://www.notion.so/74ce38d4290b402ca4cd5bf02a55119e

2. Orders
   ID: 3ff5714a-5f30-4524-b388-44a8981fc955
   URL: https://www.notion.so/3ff5714a5f304524b38844a8981fc955

...
```

### 4.3 .env.local에 DB ID 설정

위에서 확인한 DB ID를 `.env.local`에 입력합니다:

```bash
# ── Notion Official API ──
NOTION_TOKEN=ntn_여기에_토큰

# 콘텐츠 DB
NOTION_DB_TUTORIALS=여기에_Tutorials_DB_ID
NOTION_DB_MATERIALS=여기에_Materials_DB_ID
NOTION_DB_COMBOS=여기에_Combos_DB_ID
NOTION_DB_SEASONS=여기에_Seasons_DB_ID
NOTION_DB_CATEGORIES=여기에_Categories_DB_ID

# 고객 매출 관리 DB
NOTION_DB_CUSTOMERS=여기에_Customers_DB_ID
NOTION_DB_ORDERS=여기에_Orders_DB_ID
```

---

## 5단계: 연결 테스트

### 5.1 테스트 스크립트 작성

**`test-notion.mjs`**:
```javascript
import { Client } from '@notionhq/client';

const token = process.env.NOTION_TOKEN;
const customersDbId = process.env.NOTION_DB_CUSTOMERS;
const ordersDbId = process.env.NOTION_DB_ORDERS;

const notion = new Client({ auth: token });

async function test() {
  console.log('Testing Customers DB:', customersDbId);
  try {
    const customers = await notion.databases.query({
      database_id: customersDbId,
      page_size: 1,
    });
    console.log('✅ Customers DB 연결 성공! 결과:', customers.results.length, '건');
  } catch (error) {
    console.log('❌ Customers DB 연결 실패:', error.message);
  }

  console.log('\nTesting Orders DB:', ordersDbId);
  try {
    const orders = await notion.databases.query({
      database_id: ordersDbId,
      page_size: 1,
    });
    console.log('✅ Orders DB 연결 성공! 결과:', orders.results.length, '건');
  } catch (error) {
    console.log('❌ Orders DB 연결 실패:', error.message);
  }
}

test();
```

### 5.2 테스트 실행

```bash
node --env-file=.env.local test-notion.mjs
```

**성공 시**:
```
Testing Customers DB: 74ce38d4-290b-402c-a4cd-5bf02a55119e
✅ Customers DB 연결 성공! 결과: 1 건

Testing Orders DB: 3ff5714a-5f30-4524-b388-44a8981fc955
✅ Orders DB 연결 성공! 결과: 1 건
```

**실패 시**:
```
❌ Customers DB 연결 실패: Could not find database with ID: ...
```

→ [문제 해결](#문제-해결)로 이동

---

## 6단계: 빌드 테스트

### 6.1 캐시 삭제

```bash
rm -rf .next
```

### 6.2 프로덕션 빌드

```bash
npm run build
```

**성공 시**:
```
✓ Generating static pages using 9 workers (23/23)
✓ Finalizing page optimization
```

**실패 시**:
- `object_not_found` 에러가 있는지 확인
- DB ID가 올바른지 재확인
- Integration 연결 상태 재확인

### 6.3 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 데이터가 정상적으로 표시되는지 확인.

---

## 문제 해결

### "object_not_found" 에러

**에러 메시지**:
```
Could not find database with ID: xxxx-xxxx-xxxx-xxxx-xxxx.
Make sure the relevant pages and databases are shared with your integration.
```

**원인**:
1. Integration이 DB에 연결되지 않음
2. DB ID가 잘못됨
3. Token이 잘못됨

**해결 방법**:

#### 1. Integration 연결 재확인

각 데이터베이스에서:
- 우측 상단 `•••` → 연결 → Integration 선택
- 연결 상태 확인 (Integration 아이콘 표시)

#### 2. DB ID 재확인

```bash
node --env-file=.env.local check-integration.mjs
```

출력된 DB ID와 `.env.local`의 ID를 비교.

#### 3. Token 재확인

- https://www.notion.so/my-integrations 접속
- Integration 클릭
- "Show" 버튼으로 Token 확인
- `.env.local`과 비교

#### 4. 캐시 삭제 후 재시작

```bash
pkill -f "next dev"
rm -rf .next
npm run build
npm run dev
```

### "unauthorized" 에러

**원인**: Token이 잘못되었거나 만료됨

**해결 방법**:
1. https://www.notion.so/my-integrations 접속
2. Integration 클릭
3. "Regenerate" 버튼으로 새 Token 생성
4. `.env.local`에 붙여넣기
5. 서버 재시작

### Integration이 목록에 없음

**원인**: Integration이 생성되지 않았거나 삭제됨

**해결 방법**:
1. https://www.notion.so/my-integrations 접속
2. "New integration" 클릭하여 새로 생성
3. [1단계](#1단계-notion-integration-생성)부터 다시 진행

---

## Vercel 배포 시 환경 변수 설정

### Vercel 대시보드에서 설정

1. Vercel 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수들을 **Production**, **Preview**, **Development** 모두에 추가:

```
NOTION_TOKEN
NOTION_DB_TUTORIALS
NOTION_DB_MATERIALS
NOTION_DB_COMBOS
NOTION_DB_SEASONS
NOTION_DB_CATEGORIES
NOTION_DB_CUSTOMERS
NOTION_DB_ORDERS
```

4. **Save** 클릭
5. 프로젝트 재배포

**⚠️ 주의**: `.env.local` 파일은 Git에 커밋되지 않으므로, Vercel에 직접 입력해야 합니다!

---

## 보안 주의사항

### 절대 하지 말아야 할 것

1. **Token을 Git에 커밋하지 마세요**
   - `.env.local`은 `.gitignore`에 포함되어 있음
   - 실수로 커밋했다면 즉시 Token 재생성

2. **Token을 공개하지 마세요**
   - GitHub, 블로그, 이메일 등에 공유 금지
   - 스크린샷에도 주의

3. **DB ID는 상대적으로 안전합니다**
   - Token 없이는 접근 불가
   - 하지만 Git에 커밋하지 않는 것을 권장

### 해야 할 것

1. **정기적으로 Token 점검**
   - 사용하지 않는 Integration 삭제
   - 필요 시 Token 재생성

2. **.env.local 백업**
   - 안전한 곳에 별도 보관
   - 팀원과 공유 시 암호화된 채널 사용

3. **최소 권한 원칙**
   - Integration에 필요한 DB만 연결
   - 불필요한 권한 제거

---

## 참고 자료

- [Notion API 공식 문서](https://developers.notion.com/)
- [Notion SDK GitHub](https://github.com/makenotion/notion-sdk-js)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 마지막 업데이트
- 날짜: 2026-02-11
- 버전: 1.0.0
