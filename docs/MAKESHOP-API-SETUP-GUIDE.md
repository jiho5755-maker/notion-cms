# 메이크샵 Open API 설정 가이드

## 개요

PRESSCO 21 웹사이트의 **견적서 기능**과 **주문 자동 동기화**를 위해 메이크샵 Open API를 연동하는 가이드입니다.

---

## 사전 준비

- 메이크샵 관리자 권한 (admin 계정)
- 메이크샵 쇼핑몰 URL: https://www.foreverlove.co.kr

---

## Step 1: 메이크샵 관리자 페이지 접속

1. 웹 브라우저에서 메이크샵 관리자 페이지 접속:
   ```
   https://www.foreverlove.co.kr/admin
   ```

2. 관리자 계정으로 로그인
   - ID: (관리자 ID 입력)
   - Password: (관리자 비밀번호 입력)

3. 로그인 성공 후 관리자 대시보드 확인

---

## Step 2: Open API 메뉴 접속

1. 좌측 사이드바에서 **"연동 관리"** 클릭
2. 하위 메뉴에서 **"오픈 API"** 클릭

   ```
   좌측 메뉴 구조:
   ├── 쇼핑몰 관리
   ├── 상품 관리
   ├── 주문 관리
   ├── ...
   └── 연동 관리 👈 여기
       ├── 오픈 API 👈 여기
       ├── 결제/배송
       └── 기타 연동
   ```

3. Open API 설정 페이지 진입

---

## Step 3: API 인증키 발급

### 3-1. 신규 발급 (처음 사용하는 경우)

1. 페이지 상단의 **"API 인증키 발급"** 버튼 클릭
2. 팝업창에서 다음 정보 입력:
   - **인증키 이름**: `PRESSCO21 웹사이트` (구분용 이름)
   - **사용 용도**: `콘텐츠 허브 연동` (선택 사항)
3. "발급" 버튼 클릭

### 3-2. 기존 인증키 사용 (이미 발급받은 경우)

1. 기존 인증키 목록에서 사용할 키 선택
2. "상세 보기" 클릭

### 3-3. API 정보 복사

발급 완료 후 다음 두 가지 정보를 **안전하게 복사**:

```
┌─────────────────────────────────────────┐
│ Shop ID: foreverlove                    │ 👈 복사
│ Access Token: 1a2b3c4d5e6f7g8h9i0j...   │ 👈 복사 (길이: 40-50자)
└─────────────────────────────────────────┘
```

**중요**: Access Token은 한 번만 표시됩니다. 반드시 복사하여 안전한 곳에 저장하세요.

---

## Step 4: 권한 설정

API 인증키 상세 페이지에서 권한을 설정합니다.

### 4-1. 필수 권한 (ON)

- ✅ **상품 조회** — 견적서 기능에서 상품 검색
- ✅ **주문 조회** — 주문 자동 동기화

### 4-2. 선택 권한 (OFF, 보안)

- ❌ **상품 수정** — 보안상 비활성화 권장
- ❌ **주문 수정** — 보안상 비활성화 권장
- ❌ **회원 조회** — 현재 미사용

권한 설정 후 **"저장"** 버튼 클릭

---

## Step 5: 환경 변수 설정 (로컬)

### 5-1. .env.local 파일 열기

프로젝트 루트 디렉토리에서 `.env.local` 파일을 엽니다.

```bash
# 프로젝트 루트에서
code .env.local
```

### 5-2. 환경 변수 추가

파일 하단에 다음 두 줄을 추가:

```bash
# 메이크샵 Open API
MAKESHOP_SHOP_ID=foreverlove
MAKESHOP_ACCESS_TOKEN=1a2b3c4d5e6f7g8h9i0j...
```

**주의사항**:
- `MAKESHOP_SHOP_ID`: Step 3에서 복사한 Shop ID
- `MAKESHOP_ACCESS_TOKEN`: Step 3에서 복사한 Access Token (40-50자)
- 따옴표(`"`) 없이 값만 입력
- 공백 없이 입력

### 5-3. 파일 저장

파일을 저장 후 에디터 닫기

---

## Step 6: 로컬 테스트

### 6-1. 개발 서버 재시작

환경 변수 변경 후 개발 서버를 재시작해야 합니다.

```bash
# 기존 서버 종료 (터미널에서 Ctrl+C)
# 개발 서버 재시작
npm run dev
```

### 6-2. API 동작 확인

브라우저에서 다음 URL 접속:

```
http://localhost:3000/api/makeshop/products?search=키트
```

**성공 예시**:
```json
{
  "success": true,
  "products": [
    {
      "id": "123",
      "name": "압화 만들기 키트",
      "price": 25000,
      "imageUrl": "https://...",
      ...
    }
  ]
}
```

**실패 예시 (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```
→ Access Token 확인

**실패 예시 (404 Not Found)**:
```json
{
  "success": false,
  "error": "Shop not found"
}
```
→ Shop ID 확인

### 6-3. 견적서 페이지 테스트

```bash
# 브라우저에서
http://localhost:3000/quotation
```

1. "상품 검색" 탭 클릭
2. 검색어 입력 (예: "압화")
3. 검색 버튼 클릭
4. 메이크샵 상품이 표시되는지 확인

**성공**: 상품 카드가 표시됨
**실패**: "노션 Materials 데이터를 사용합니다" 알림 표시 → API 설정 재확인

---

## Step 7: Vercel 환경 변수 설정 (프로덕션)

### 7-1. Vercel 대시보드 접속

1. https://vercel.com/ 접속 및 로그인
2. 프로젝트 선택: **notion-cms**
3. 상단 탭에서 **"Settings"** 클릭
4. 좌측 메뉴에서 **"Environment Variables"** 클릭

### 7-2. 환경 변수 추가

**첫 번째 변수**:
- Key: `MAKESHOP_SHOP_ID`
- Value: `foreverlove` (Step 3에서 복사한 값)
- Environment: **Production**, **Preview**, **Development** 모두 체크
- "Save" 클릭

**두 번째 변수**:
- Key: `MAKESHOP_ACCESS_TOKEN`
- Value: `1a2b3c4d5e6f7g8h9i0j...` (Step 3에서 복사한 Access Token)
- Environment: **Production**, **Preview**, **Development** 모두 체크
- "Save" 클릭

### 7-3. 재배포 트리거

환경 변수 추가 후 재배포가 필요합니다.

**방법 1: Vercel 대시보드에서**
1. "Deployments" 탭 클릭
2. 최신 배포 우측의 "..." 메뉴 클릭
3. "Redeploy" 선택
4. "Redeploy" 버튼 클릭

**방법 2: Git Push로 자동 배포**
```bash
# 빈 커밋 생성
git commit --allow-empty -m "chore: 환경 변수 업데이트 후 재배포"
git push origin main
```

### 7-4. 배포 완료 확인

1. Vercel 대시보드에서 배포 상태 확인
2. "Ready" 상태가 되면 프로덕션 URL 클릭
3. `/api/makeshop/products?search=키트` 접속
4. 상품 목록이 표시되는지 확인

---

## 트러블슈팅

### 문제 1: 401 Unauthorized 에러

**원인**: Access Token이 잘못됨

**해결**:
1. 메이크샵 관리자 → 연동 관리 → 오픈 API
2. 기존 인증키 삭제
3. 신규 인증키 재발급
4. `.env.local` 및 Vercel 환경 변수 업데이트
5. 개발 서버 재시작 / Vercel 재배포

### 문제 2: 404 Not Found 에러

**원인**: Shop ID가 잘못됨

**해결**:
1. Shop ID 확인: 메이크샵 URL에서 확인
   - URL: `https://www.foreverlove.co.kr/admin`
   - Shop ID: `foreverlove` (도메인 앞부분)
2. `.env.local`의 `MAKESHOP_SHOP_ID` 수정
3. 개발 서버 재시작

### 문제 3: 429 Too Many Requests

**원인**: API 호출 제한 초과 (시간당 500회)

**해결**:
1. 현재 코드는 ISR 캐싱 10분 적용 (자동 최적화)
2. 추가 최적화 필요 시 캐싱 시간 연장:
   ```typescript
   // src/app/api/makeshop/products/route.ts
   export const revalidate = 1800; // 30분
   ```
3. 1시간 대기 후 재시도

### 문제 4: CORS 에러

**원인**: 브라우저에서 직접 메이크샵 API 호출 시도

**해결**:
- 현재 구현은 Next.js API Route를 프록시로 사용 (자동 해결)
- 별도 조치 불필요

### 문제 5: 권한 부족 에러

**원인**: 메이크샵 관리자에서 권한 미설정

**해결**:
1. 메이크샵 관리자 → 연동 관리 → 오픈 API
2. API 인증키 상세 보기
3. "상품 조회" 권한 ON
4. "주문 조회" 권한 ON (주문 동기화 시)
5. "저장" 클릭

### 문제 6: 환경 변수가 적용 안 됨

**로컬 환경**:
```bash
# 개발 서버 재시작 필수
npm run dev
```

**Vercel 환경**:
1. 환경 변수 저장 후 반드시 재배포
2. 배포 완료까지 2-3분 대기

---

## API 사용량 모니터링

### 현재 사용량 확인

메이크샵 관리자 → 연동 관리 → 오픈 API → "사용량 통계"

- **조회 API**: 시간당 500회 제한
- **처리 API**: 시간당 500회 제한 (수정/삭제)

### 최적화 전략

현재 구현된 최적화:
- ISR 캐싱: 10분 (상품 목록/상세)
- 노션 Fallback: API 실패 시 자동 전환

추가 최적화 (필요 시):
- 캐싱 시간 연장: 10분 → 30분
- 배치 처리: 한 번에 여러 상품 조회
- CDN 캐싱: Vercel Edge 캐싱 활용

---

## 보안 권고사항

### 1. Access Token 보호
- ✅ `.env.local` 파일은 `.gitignore`에 등록됨 (자동)
- ✅ GitHub에 절대 업로드하지 않기
- ✅ Vercel 환경 변수는 암호화되어 저장됨

### 2. 권한 최소화
- ❌ "상품 수정" 권한 비활성화
- ❌ "주문 수정" 권한 비활성화
- ✅ 조회 권한만 활성화 (읽기 전용)

### 3. 정기 키 갱신
- 6개월마다 Access Token 재발급 권장
- 키 유출 의심 시 즉시 폐기 후 재발급

### 4. IP 화이트리스트 (선택)
메이크샵 관리자에서 접속 IP 제한 가능:
- Vercel IP 범위: https://vercel.com/docs/edge-network/regions
- 보안 강화 필요 시 적용

---

## 완료 체크리스트

### 로컬 환경
- [ ] 메이크샵 관리자 접속 (연동 관리 → 오픈 API)
- [ ] API 인증키 발급 (Shop ID + Access Token)
- [ ] 권한 설정 (상품 조회 ON, 주문 조회 ON)
- [ ] `.env.local`에 환경 변수 추가
- [ ] 개발 서버 재시작 (`npm run dev`)
- [ ] API 테스트 (`/api/makeshop/products?search=키트`)
- [ ] 견적서 페이지 테스트 (`/quotation`)

### 프로덕션 환경
- [ ] Vercel 대시보드 접속 (Settings → Environment Variables)
- [ ] `MAKESHOP_SHOP_ID` 환경 변수 추가
- [ ] `MAKESHOP_ACCESS_TOKEN` 환경 변수 추가
- [ ] Vercel 재배포 트리거
- [ ] 배포 완료 확인 (Ready 상태)
- [ ] 프로덕션 URL에서 API 테스트
- [ ] 프로덕션 견적서 페이지 테스트

---

## 참고 자료

- [메이크샵 Open API 공식 문서](https://www.makeshop.co.kr/manual/apimanual.html)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel 환경 변수 설정](https://vercel.com/docs/projects/environment-variables)

---

## 문의

메이크샵 API 설정 중 문제가 발생하면:
1. 메이크샵 고객센터: 1588-6688
2. 메이크샵 관리자 → 고객센터 → 1:1 문의

---

**작성일**: 2026-02-12
**버전**: 1.0
**예상 소요 시간**: 20분 (발급 10분 + 설정 10분)
