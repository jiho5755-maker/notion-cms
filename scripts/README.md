# PRESSCO 21 — 자동화 스크립트

PRESSCO 21 콘텐츠 허브를 위한 CLI 자동화 도구 모음입니다.

## 📝 스크립트 목록

### 1. Instagram 카드 이미지 생성

튜토리얼 정보를 기반으로 1080x1080px Instagram 카드 이미지를 자동 생성합니다.

#### 사용법

```bash
npm run instagram:card -- <tutorial-slug>
```

#### 예시

```bash
npm run instagram:card -- pressed-flower-bookmark
```

#### 출력

- **경로**: `public/instagram-cards/{slug}.png`
- **크기**: 1080x1080px
- **포맷**: PNG

#### 템플릿 구성

- **배경**: 튜토리얼 커버 이미지 (blur + 어두운 오버레이)
  - 커버 이미지가 없으면 placeholder 사용
- **왼쪽 상단**: 난이도 배지 (초급/중급/고급)
  - 초급: 녹색 (#10B981)
  - 중급: 주황색 (#F59E0B)
  - 고급: 빨강색 (#EF4444)
- **오른쪽 상단**: 소요 시간 (예: "30분")
- **중앙**: 제목 (자동 줄바꿈 처리)
- **하단**: PRESSCO 21 브랜드 로고 + 슬로건

#### 에러 처리

- **튜토리얼 없음**: slug가 존재하지 않으면 에러 발생
- **커버 이미지 없음**: placeholder.svg 사용 (자동 폴백)
- **환경 변수 누락**: `NOTION_TOKEN`, `NOTION_DB_TUTORIALS` 필수

#### 기술 스택

- **canvas**: 이미지 생성 라이브러리
- **Notion Official SDK**: 튜토리얼 데이터 조회
- **dotenv**: 환경 변수 로드 (.env.local)

---

### 2. YouTube 설명 생성 (예정)

```bash
npm run youtube:desc -- <tutorial-slug>
```

_(향후 추가 예정)_

---

## 🛠️ 개발 가이드

### 새 스크립트 추가하기

1. **스크립트 파일 생성**
   ```bash
   scripts/generate-something.ts
   ```

2. **package.json에 명령어 추가**
   ```json
   {
     "scripts": {
       "something": "tsx scripts/generate-something.ts"
     }
   }
   ```

3. **환경 변수 로드**
   ```typescript
   import dotenv from "dotenv";
   import path from "path";

   dotenv.config({ path: path.join(process.cwd(), ".env.local") });
   ```

4. **CLI 인자 처리**
   ```typescript
   const slug = process.argv[2];
   if (!slug) {
     console.error("사용법: npm run something -- <slug>");
     process.exit(1);
   }
   ```

### Notion API 직접 조회 패턴

스크립트에서는 `unstable_cache`를 사용할 수 없으므로 직접 조회 함수를 작성해야 합니다.

```typescript
import { Client } from "@notionhq/client";

function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[Notion] NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }
  return new Client({ auth: process.env.NOTION_TOKEN });
}

async function fetchData() {
  const client = getNotionClient();
  const response = await client.databases.query({
    database_id: process.env.NOTION_DB_SOMETHING,
  });
  // ...
}
```

---

## 📚 참고

- **Notion API 문서**: https://developers.notion.com/
- **canvas 라이브러리**: https://github.com/Automattic/node-canvas
- **프로젝트 메인 문서**: `/CLAUDE.md`
