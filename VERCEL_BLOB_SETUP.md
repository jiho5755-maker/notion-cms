# Vercel Blob 환경 변수 설정 가이드

## 📌 핵심 환경 변수

Vercel Blob은 단 하나의 환경 변수만 필요합니다:
- **`BLOB_READ_WRITE_TOKEN`** - 읽기/쓰기 권한이 있는 토큰

---

## 🚀 설정 방법 (3가지)

### **방법 1: Vercel Dashboard에서 자동 설정 (추천) ✨**

가장 쉬운 방법입니다!

#### 1단계: Vercel Dashboard 접속
- https://vercel.com 로그인
- 프로젝트 선택 (`notion-cms`)

#### 2단계: Storage 탭으로 이동
- 상단 메뉴에서 `Storage` 클릭

#### 3단계: Blob Store 생성
- `Create Database` 버튼 클릭
- `Blob` 선택
- Store 이름 입력 (예: `pressco21-blob`)
- `Create` 클릭

#### 4단계: 프로젝트 연결
- `Connect Project` 버튼 클릭
- 연결할 프로젝트 선택 (`notion-cms`)
- 환경 선택 (Production, Preview, Development 모두 체크 ✅)
- `Connect` 클릭

#### 5단계: 자동 완료! ✅
- `BLOB_READ_WRITE_TOKEN`이 자동으로 환경 변수에 추가됩니다
- Settings → Environment Variables에서 확인 가능
- **재배포 필요 없음** (즉시 적용)

---

### **방법 2: 수동으로 환경 변수 추가**

이미 Blob Store가 있는 경우:

#### 1단계: Blob Store 페이지에서 토큰 복사
- Dashboard → Storage → Blob Store 선택
- `.env.local` 탭 클릭
- `BLOB_READ_WRITE_TOKEN` 값 복사

#### 2단계: 환경 변수에 추가
- Dashboard → 프로젝트 선택 → Settings → Environment Variables
- `Add New` 클릭
- **Key**: `BLOB_READ_WRITE_TOKEN`
- **Value**: 복사한 토큰 붙여넣기 (예: `vercel_blob_rw_xxxxx`)
- **환경 선택**: Production, Preview, Development 모두 체크
- `Save` 클릭

#### 3단계: 재배포 (Production만)
Production 환경에 추가한 경우 재배포가 필요합니다:
```bash
vercel --prod
```

---

### **방법 3: Vercel CLI로 로컬 환경 변수 동기화 (개발용)**

로컬 개발 환경 설정:

```bash
# 1. Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 2. 프로젝트 연결 (최초 1회만)
vercel link

# 3. 환경 변수를 로컬로 가져오기
vercel env pull .env.local
```

이제 `.env.local` 파일에 `BLOB_READ_WRITE_TOKEN`이 자동으로 추가됩니다!

**`.env.local` 파일 예시:**
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
NOTION_TOKEN=secret_xxxxxxxxxxxxx
# ... 기타 환경 변수
```

---

## 🔧 코드에서 사용하기

### **자동 감지 (Zero Config)**

Vercel 환경에서는 자동으로 토큰을 감지합니다:

```typescript
import { put } from '@vercel/blob';

// token 파라미터 생략 가능 (자동 감지)
const blob = await put('file.txt', 'Hello World!', {
  access: 'public',
});
```

### **명시적 전달 (권장)**

환경 변수를 명시적으로 전달하는 것이 더 안전합니다:

```typescript
import { put, list, del, head } from '@vercel/blob';

// 업로드
const blob = await put('file.txt', 'Hello World!', {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN, // 명시적 전달
});

// 목록 조회
const result = await list({
  prefix: 'inquiries/',
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

// 삭제
await del(blob.url, {
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

// 메타데이터 조회
const metadata = await head(blob.url, {
  token: process.env.BLOB_READ_WRITE_TOKEN,
});
```

**현재 프로젝트의 `/api/upload/route.ts`에서 사용 중:**

```typescript
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    // token은 Vercel 환경에서 자동 감지됨
  });

  return NextResponse.json({ url: blob.url });
}
```

---

## ✅ 설정 확인 방법

### **1. Vercel Dashboard에서 확인**
- Settings → Environment Variables
- `BLOB_READ_WRITE_TOKEN`이 보여야 함
- 환경별로 설정되었는지 확인 (Production, Preview, Development)

### **2. 로컬 환경에서 확인**
```bash
# .env.local 파일 확인
cat .env.local | grep BLOB_READ_WRITE_TOKEN

# 또는
echo $BLOB_READ_WRITE_TOKEN
```

### **3. API Route 테스트**
```bash
# 파일 업로드 테스트
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.jpg"

# 성공 시:
# {"url":"https://xxx.public.blob.vercel-storage.com/inquiries/2026-02-12/abc123.jpg","pathname":"...","size":1024,"contentType":"image/jpeg"}
```

---

## 🔒 보안 주의사항

### **1. `.env.local` 파일은 절대 커밋하지 마세요!**
`.gitignore`에 이미 추가되어 있습니다:
```
.env*.local
.env.local
```

### **2. 토큰 노출 방지**
- GitHub, Discord 등에 토큰을 절대 공유하지 마세요
- 클라이언트 코드에서 토큰을 직접 사용하지 마세요
- 항상 **API Route (서버 사이드)**에서만 사용하세요

### **3. 토큰 재생성 (유출된 경우)**
1. Dashboard → Storage → Blob Store
2. Settings → Regenerate Token
3. 새 토큰을 환경 변수에 업데이트
4. 재배포

---

## 🐛 문제 해결

### **문제 1: "Missing Blob read/write token" 에러**
**원인**: `BLOB_READ_WRITE_TOKEN`이 설정되지 않았거나 잘못됨

**해결:**
```bash
# 1. 로컬 환경 변수 확인
cat .env.local | grep BLOB_READ_WRITE_TOKEN

# 2. Vercel 환경 변수 재동기화
vercel env pull .env.local --force

# 3. 개발 서버 재시작
npm run dev
```

### **문제 2: "Invalid token" 에러**
**원인**: 토큰이 만료되었거나 잘못됨

**해결:**
1. Dashboard에서 토큰 재생성
2. 새 토큰을 `.env.local`에 업데이트
3. Vercel 환경 변수도 업데이트 (Production용)

### **문제 3: 로컬에서는 되는데 배포 후 안 됨**
**원인**: Production 환경에 `BLOB_READ_WRITE_TOKEN`이 없음

**해결:**
1. Dashboard → Settings → Environment Variables
2. Production 환경에 `BLOB_READ_WRITE_TOKEN` 추가 확인
3. 재배포: `vercel --prod`

### **문제 4: Vite에서 `process.env` 접근 불가**
**원인**: Vite는 `.env` 변수를 `process.env`에 자동으로 노출하지 않음

**해결 (dotenv 사용):**
```bash
npm install -D dotenv dotenv-expand
```

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    const env = dotenv.config({ path: '.env.local' });
    dotenvExpand.expand(env);
  }

  return {
    // ... 기타 설정
  };
});
```

---

## 📊 비용 및 제한

### **무료 플랜 (Hobby)**
- ✅ 500GB 전송량/월
- ✅ 무제한 요청
- ✅ 충분함 (일반적인 사용)

### **Pro 플랜**
- ✅ 1TB 전송량/월
- ✅ 무제한 요청
- ✅ $20/월

자세한 내용: https://vercel.com/docs/storage/vercel-blob/usage-and-pricing

---

## 📚 추가 리소스

- [Vercel Blob 공식 문서](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Storage 개요](https://vercel.com/docs/storage)
- [@vercel/blob npm 패키지](https://www.npmjs.com/package/@vercel/blob)
- [Vercel Blob Next.js Starter](https://vercel.com/templates/next.js/blob-starter)

---

## ✅ 체크리스트

현재 프로젝트 상태:

- [x] `@vercel/blob` 패키지 설치됨
- [x] `/api/upload/route.ts` API Route 구현됨
- [x] 파일 검증 로직 완료 (5MB, 이미지/PDF)
- [ ] Vercel Dashboard에서 Blob Store 생성
- [ ] 프로젝트에 Blob Store 연결
- [ ] `BLOB_READ_WRITE_TOKEN` 환경 변수 설정 (Production, Preview, Development)
- [ ] 로컬 환경 변수 동기화 (`vercel env pull .env.local`)
- [ ] 파일 업로드 테스트

---

**다음 단계:** Vercel Dashboard에서 Blob Store를 생성하고 프로젝트에 연결하세요! 🚀
