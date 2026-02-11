# 서브도메인 전환 실행 가이드

> PRESSCO 21 프로젝트 — 도메인 자동 전환 스크립트 사용 가이드
> 작성일: 2026-02-12
> 작성자: Claude Sonnet 4.5

---

## 목차

1. [개요](#개요)
2. [사전 준비](#사전-준비)
3. [Phase 1: DNS 설정](#phase-1-dns-설정)
4. [Phase 2: 스크립트 실행](#phase-2-스크립트-실행)
5. [Phase 3: Vercel 설정](#phase-3-vercel-설정)
6. [Phase 4: 배포 및 검증](#phase-4-배포-및-검증)
7. [롤백 방법](#롤백-방법)
8. [트러블슈팅](#트러블슈팅)
9. [체크리스트](#체크리스트)

---

## 개요

이 가이드는 PRESSCO 21 프로젝트를 기존 `pressco21.vercel.app`에서
`content.foreverlove.co.kr` 서브도메인으로 자동 전환하는 방법을 설명합니다.

### 변경 전후 비교

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| **메인 도메인** | `pressco21.vercel.app` | `content.foreverlove.co.kr` |
| **DNS** | Vercel 기본 | CNAME → Vercel |
| **리다이렉트** | 없음 | 기존 도메인 → 새 도메인 (301) |
| **환경 변수** | `NEXT_PUBLIC_SITE_URL=https://pressco21.vercel.app` | `NEXT_PUBLIC_SITE_URL=https://content.foreverlove.co.kr` |

### 자동화 스크립트 기능

- ✅ `.env.local` 환경 변수 업데이트
- ✅ `layout.tsx` metadataBase 수정
- ✅ `sitemap.ts` URL 변경
- ✅ `robots.ts` sitemap URL 변경
- ✅ `vercel.json` 리다이렉트 설정 생성
- ✅ 자동 백업 생성
- ✅ 변경 사항 미리보기
- ✅ 확인 프롬프트
- ✅ 롤백 기능

---

## 사전 준비

### 필수 요구사항

- [ ] 도메인 소유: `foreverlove.co.kr` 도메인에 대한 관리 권한
- [ ] 도메인 등록업체 로그인 정보 (가비아, 후이즈, 카페24 등)
- [ ] Vercel 계정 로그인 정보
- [ ] Git 저장소 푸시 권한

### 예상 소요 시간

- **작업 시간**: 30분 (스크립트 실행 + Vercel 설정)
- **DNS 전파**: 1~2시간 (최대 48시간)
- **총 소요 기간**: 2~3일 (DNS 전파 + 검증)

### 백업 확인

스크립트는 자동으로 백업을 생성하지만, 수동 백업도 권장합니다:

```bash
# 전체 프로젝트 백업 (선택)
cp -r /Users/jangjiho/workspace/notion-cms /Users/jangjiho/workspace/notion-cms.backup

# Git 커밋 확인
git status
git log -1
```

---

## Phase 1: DNS 설정

### 1.1 도메인 등록업체 관리 페이지 접속

도메인 등록업체별 관리 페이지:

- **가비아**: https://domain.gabia.com/
- **후이즈**: https://whois.co.kr/
- **카페24**: https://www.cafe24.com/
- **네임싸인**: https://www.namesign.co.kr/

로그인 후 `foreverlove.co.kr` 도메인 선택

### 1.2 DNS 관리 메뉴 진입

각 업체별 메뉴 경로:

- **가비아**: My가비아 → 도메인 → DNS 정보 → DNS 관리
- **후이즈**: 도메인 관리 → DNS 관리 → 레코드 추가
- **카페24**: 나의 서비스 관리 → 도메인 관리 → DNS 설정

### 1.3 CNAME 레코드 추가

다음 정보로 CNAME 레코드를 추가합니다:

| 항목 | 값 | 설명 |
|------|-----|------|
| **Type** | `CNAME` | 레코드 유형 |
| **Host/Name** | `content` | 서브도메인 이름 (전체 도메인 아님) |
| **Value/Target** | `cname.vercel-dns.com.` | Vercel CNAME 주소 (끝에 `.` 필수) |
| **TTL** | `3600` | 1시간 (초 단위) |

**⚠️ 주의사항**:

- Host 필드에는 `content`만 입력 (❌ `content.foreverlove.co.kr` 아님)
- Value 끝에 반드시 `.` (점) 포함 (예: `cname.vercel-dns.com.`)
- TTL은 3600초(1시간) 권장

### 1.4 DNS 레코드 설정 예시 (가비아)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DNS 레코드 추가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  레코드 종류: CNAME
  호스트:      content
  값/위치:     cname.vercel-dns.com.
  TTL:         3600
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**저장** 버튼 클릭

### 1.5 DNS 전파 대기 및 확인

DNS 레코드가 전파되는 데 시간이 걸립니다:

- **일반적**: 1~2시간
- **최대**: 48시간 (드물게)

#### DNS 전파 확인 방법

**방법 1: nslookup 명령어** (권장)

```bash
nslookup content.foreverlove.co.kr
```

**성공 예시**:
```
Non-authoritative answer:
Name:    content.foreverlove.co.kr
Address: 76.76.21.21  # Vercel IP
```

**실패 예시** (아직 전파 안 됨):
```
** server can't find content.foreverlove.co.kr: NXDOMAIN
```

**방법 2: 온라인 DNS 체커**

- https://dnschecker.org/
  - `content.foreverlove.co.kr` 입력
  - CNAME 레코드 유형 선택
  - 전 세계 서버에서 전파 상태 확인

- https://www.whatsmydns.net/
  - 여러 지역에서 DNS 조회 결과 비교

**✅ DNS 전파 완료 조건**:
- `nslookup` 결과에 Vercel IP 주소 (76.76.x.x) 표시
- 또는 CNAME이 `cname.vercel-dns.com`으로 표시

---

## Phase 2: 스크립트 실행

### 2.1 스크립트 미리보기 (권장)

실제 변경 전에 어떤 내용이 바뀌는지 확인합니다:

```bash
cd /Users/jangjiho/workspace/notion-cms
npm run migrate:subdomain -- --preview
```

**출력 예시**:
```
━━━━ 변경 미리보기 ━━━━

📄 .env.local
  - NEXT_PUBLIC_SITE_URL=https://pressco21.vercel.app
  + NEXT_PUBLIC_SITE_URL=https://content.foreverlove.co.kr

📄 src/app/layout.tsx
  - process.env.NEXT_PUBLIC_SITE_URL ?? "https://pressco21.vercel.app"
  + process.env.NEXT_PUBLIC_SITE_URL ?? "https://content.foreverlove.co.kr"

📄 src/app/sitemap.ts
  - process.env.NEXT_PUBLIC_SITE_URL || "https://pressco21.vercel.app"
  + process.env.NEXT_PUBLIC_SITE_URL || "https://content.foreverlove.co.kr"

📄 src/app/robots.ts
  - process.env.NEXT_PUBLIC_SITE_URL || "https://pressco21.vercel.app"
  + process.env.NEXT_PUBLIC_SITE_URL || "https://content.foreverlove.co.kr"

📄 vercel.json (신규 생성)
  {
    "redirects": [
      {
        "source": "/:path*",
        "has": [{ "type": "host", "value": "pressco21.vercel.app" }],
        "destination": "https://content.foreverlove.co.kr/:path*",
        "permanent": true
      }
    ]
  }
```

### 2.2 스크립트 실행

변경 사항을 확인했다면 실제 전환을 실행합니다:

```bash
npm run migrate:subdomain
```

**실행 화면**:
```
━━━━ 서브도메인 전환 자동화 스크립트 ━━━━

기존 도메인: https://pressco21.vercel.app
새 도메인: https://content.foreverlove.co.kr

━━━━ 변경 사항 확인 ━━━━

(... 변경 미리보기 출력 ...)

━━━━ 변경 미리보기 ━━━━

(... 동일한 내용 ...)

⚠️  위 내용대로 파일을 변경하시겠습니까? (y/N):
```

`y` 입력 후 Enter

**완료 화면**:
```
━━━━ 파일 변경 중... ━━━━

✅ 백업 생성: .env.local.backup
✅ .env.local 업데이트 완료
✅ 백업 생성: layout.tsx.backup
✅ layout.tsx 업데이트 완료
✅ 백업 생성: sitemap.ts.backup
✅ sitemap.ts 업데이트 완료
✅ 백업 생성: robots.ts.backup
✅ robots.ts 업데이트 완료
✅ vercel.json 생성 완료

━━━━ 완료 ━━━━

✅ 서브도메인 전환이 완료되었습니다!

ℹ️  다음 단계:
  1. Vercel에 도메인 추가: https://vercel.com/
     - Settings → Domains → Add Domain
     - 입력: content.foreverlove.co.kr

  2. 환경 변수 업데이트:
     - Vercel Dashboard → Settings → Environment Variables
     - NEXT_PUBLIC_SITE_URL = https://content.foreverlove.co.kr

  3. 재배포:
     - git add .
     - git commit -m "서브도메인 전환 완료"
     - git push

  4. DNS 확인:
     - nslookup content.foreverlove.co.kr

ℹ️  상세 가이드: /Users/jangjiho/workspace/notion-cms/docs/SUBDOMAIN-MIGRATION-GUIDE.md
```

### 2.3 변경 사항 확인

스크립트가 생성한 파일들을 확인합니다:

```bash
# 백업 파일 확인
ls -la *.backup src/app/*.backup

# 변경된 파일 확인
git status

# 변경 내용 비교
git diff .env.local
git diff src/app/layout.tsx
git diff src/app/sitemap.ts
git diff src/app/robots.ts
git diff vercel.json
```

### 2.4 스크립트 옵션 (고급)

#### 확인 프롬프트 건너뛰기 (자동 실행)

```bash
npm run migrate:subdomain -- --yes
# 또는
npm run migrate:subdomain -- -y
```

#### 드라이런 (파일 변경 안 함, 백업 생성 안 함)

```bash
npm run migrate:subdomain -- --dry-run
```

#### 도움말

```bash
npm run migrate:subdomain -- --help
```

---

## Phase 3: Vercel 설정

### 3.1 Vercel Dashboard 접속

1. https://vercel.com/ 로그인
2. PRESSCO 21 프로젝트 선택
3. 상단 메뉴에서 **Settings** 클릭

### 3.2 커스텀 도메인 추가

1. 왼쪽 사이드바에서 **Domains** 선택
2. **Add** 버튼 클릭
3. `content.foreverlove.co.kr` 입력 (https:// 제외)
4. **Add** 버튼 클릭

### 3.3 도메인 검증 대기

Vercel이 자동으로 DNS 레코드를 확인합니다.

**검증 중**:
```
⏳ content.foreverlove.co.kr
   Pending Configuration
   Verifying DNS records...
```

**검증 성공**:
```
✅ content.foreverlove.co.kr
   Valid Configuration
   SSL: Active (Let's Encrypt)
```

**검증 실패**:
```
❌ content.foreverlove.co.kr
   Invalid Configuration
   DNS record not found
```

**실패 시 대응**:
- DNS 전파가 완료되지 않음 → 1~2시간 더 대기
- DNS 레코드 오타 → [Phase 1](#phase-1-dns-설정) 재확인
- Vercel에서 **Refresh** 버튼 클릭

### 3.4 환경 변수 업데이트

1. 왼쪽 사이드바에서 **Environment Variables** 선택
2. `NEXT_PUBLIC_SITE_URL` 검색
3. **Edit** 버튼 클릭
4. Value를 `https://content.foreverlove.co.kr`로 변경
5. **Production**, **Preview**, **Development** 모두 체크
6. **Save** 버튼 클릭

**⚠️ 중요**: 환경 변수 변경 후 재배포 필요

---

## Phase 4: 배포 및 검증

### 4.1 Git 커밋 및 푸시

```bash
cd /Users/jangjiho/workspace/notion-cms

# 변경 사항 확인
git status

# 변경 파일 스테이징 (백업 파일 제외)
git add .env.local
git add src/app/layout.tsx
git add src/app/sitemap.ts
git add src/app/robots.ts
git add vercel.json

# 커밋
git commit -m "서브도메인 전환 완료

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 푸시
git push
```

### 4.2 Vercel 자동 배포 확인

푸시 후 Vercel이 자동으로 배포를 시작합니다.

1. Vercel Dashboard → **Deployments** 메뉴
2. 최신 배포 상태 확인 (Building → Ready)
3. 배포 완료까지 약 2~3분 소요

**배포 성공**:
```
✅ Production Deployment
   content.foreverlove.co.kr
   Deployed 2m ago
```

### 4.3 도메인 접속 테스트

#### 4.3.1 새 도메인 접속

```bash
curl -I https://content.foreverlove.co.kr
```

**성공 응답**:
```
HTTP/2 200
content-type: text/html; charset=utf-8
x-vercel-id: ...
```

브라우저로도 확인:
- https://content.foreverlove.co.kr
- https://content.foreverlove.co.kr/tutorials
- https://content.foreverlove.co.kr/combos

#### 4.3.2 기존 도메인 리다이렉트 테스트

```bash
curl -I https://pressco21.vercel.app
```

**성공 응답** (301 Redirect):
```
HTTP/2 301
location: https://content.foreverlove.co.kr/
x-vercel-id: ...
```

브라우저에서 확인:
- https://pressco21.vercel.app → 자동으로 https://content.foreverlove.co.kr로 이동

### 4.4 SSL 인증서 확인

브라우저 주소창에서 자물쇠 아이콘 클릭:

```
🔒 연결이 안전함
  유효한 인증서 (Let's Encrypt)
  만료일: (발급일로부터 90일)
```

### 4.5 sitemap.xml 및 robots.txt 확인

```bash
# sitemap.xml 확인
curl https://content.foreverlove.co.kr/sitemap.xml

# robots.txt 확인
curl https://content.foreverlove.co.kr/robots.txt
```

**sitemap.xml 예상 출력**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://content.foreverlove.co.kr/</loc>
    <lastmod>2026-02-12T...</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1</priority>
  </url>
  <!-- ... 더 많은 URL ... -->
</urlset>
```

**robots.txt 예상 출력**:
```
User-Agent: *
Allow: /
Disallow: /api/

Sitemap: https://content.foreverlove.co.kr/sitemap.xml
```

### 4.6 Google Search Console 등록 (선택)

SEO를 위해 Google Search Console에 새 도메인을 등록합니다.

1. https://search.google.com/search-console/ 접속
2. **속성 추가** 클릭
3. **URL 접두어** 선택
4. `https://content.foreverlove.co.kr` 입력
5. 소유권 확인 (Vercel이 자동으로 메타 태그 추가됨)
6. **사이트맵 제출**: `https://content.foreverlove.co.kr/sitemap.xml`

---

## 롤백 방법

### 5.1 언제 롤백이 필요한가?

- DNS 설정 오류로 사이트가 작동하지 않을 때
- Vercel 도메인 검증에 실패했을 때
- 긴급하게 기존 도메인으로 되돌려야 할 때

### 5.2 자동 롤백 (권장)

스크립트가 생성한 백업 파일로 자동 복원합니다:

```bash
npm run migrate:subdomain -- --rollback
```

**실행 화면**:
```
━━━━ 서브도메인 전환 롤백 ━━━━

다음 백업 파일이 발견되었습니다:
  - .env.local.backup
  - layout.tsx.backup
  - sitemap.ts.backup
  - robots.ts.backup
  - vercel.json.backup

⚠️  백업 파일로 복원하시겠습니까? (y/N): y

━━━━ 복원 중... ━━━━

✅ 복원 완료: .env.local
✅ 복원 완료: layout.tsx
✅ 복원 완료: sitemap.ts
✅ 복원 완료: robots.ts
✅ 복원 완료: vercel.json

━━━━ 완료 ━━━━

✅ 롤백이 완료되었습니다!

ℹ️  백업 파일은 수동으로 삭제해주세요:
  - /Users/jangjiho/workspace/notion-cms/.env.local.backup
  - /Users/jangjiho/workspace/notion-cms/src/app/layout.tsx.backup
  - /Users/jangjiho/workspace/notion-cms/src/app/sitemap.ts.backup
  - /Users/jangjiho/workspace/notion-cms/src/app/robots.ts.backup
  - /Users/jangjiho/workspace/notion-cms/vercel.json.backup
```

### 5.3 롤백 후 재배포

```bash
# Git 커밋
git add .
git commit -m "롤백: 서브도메인 전환 취소"
git push

# Vercel 환경 변수도 원복
# Vercel Dashboard → Settings → Environment Variables
# NEXT_PUBLIC_SITE_URL = https://pressco21.vercel.app
```

### 5.4 백업 파일 정리

롤백 후 백업 파일을 삭제하려면:

```bash
npm run migrate:subdomain -- --clean
```

또는 수동 삭제:

```bash
rm -f .env.local.backup
rm -f src/app/layout.tsx.backup
rm -f src/app/sitemap.ts.backup
rm -f src/app/robots.ts.backup
rm -f vercel.json.backup
```

---

## 트러블슈팅

### 문제 1: DNS 전파가 안 됨 (nslookup 실패)

**증상**:
```bash
$ nslookup content.foreverlove.co.kr
** server can't find content.foreverlove.co.kr: NXDOMAIN
```

**원인**:
- DNS 레코드가 아직 전파되지 않음
- DNS 레코드 설정 오류

**해결**:
1. DNS 설정 재확인 (Host: `content`, Value: `cname.vercel-dns.com.`)
2. Value 끝에 `.` (점) 있는지 확인
3. TTL을 3600초로 설정했는지 확인
4. 최대 48시간 대기
5. 도메인 등록업체 고객센터 문의

---

### 문제 2: Vercel 도메인 검증 실패

**증상**:
```
❌ content.foreverlove.co.kr
   Invalid Configuration
   DNS record not found
```

**원인**:
- DNS 레코드가 Vercel을 가리키지 않음
- DNS 전파가 아직 완료되지 않음

**해결**:
1. DNS 전파 확인:
   ```bash
   nslookup content.foreverlove.co.kr
   ```
2. Vercel IP인지 확인 (`76.76.x.x` 또는 `cname.vercel-dns.com`)
3. 1~2시간 대기 후 Vercel에서 **Refresh** 버튼 클릭
4. 실패 시 Vercel에서 도메인 삭제 후 재추가

---

### 문제 3: SSL 인증서 발급 실패

**증상**:
```
⏳ content.foreverlove.co.kr
   Valid Configuration
   SSL: Pending
```

**원인**:
- Let's Encrypt가 도메인 소유권 확인 실패
- DNS 전파 미완료

**해결**:
1. DNS 전파 완료 확인 (24시간 이상 대기)
2. Vercel Dashboard → Domains → **Refresh** 버튼 클릭
3. 실패 시:
   - Vercel에서 도메인 삭제
   - 1시간 대기
   - 도메인 재추가

---

### 문제 4: 기존 Vercel 도메인 리다이렉트 안 됨

**증상**:
```bash
$ curl -I https://pressco21.vercel.app
HTTP/2 200  # 301이 아님
```

**원인**:
- `vercel.json` 설정 오류
- 배포 미완료

**해결**:
1. `vercel.json` 파일 확인 (JSON 문법 에러)
   ```bash
   cat vercel.json
   ```
2. 재배포:
   ```bash
   git add vercel.json
   git commit -m "vercel.json 수정"
   git push
   ```
3. Vercel Dashboard → Deployments → 최신 배포 확인

---

### 문제 5: sitemap.xml이 여전히 기존 도메인으로 표시됨

**증상**:
```bash
$ curl https://content.foreverlove.co.kr/sitemap.xml
<loc>https://pressco21.vercel.app/...</loc>
```

**원인**:
- 환경 변수 미업데이트
- ISR 캐시 미갱신

**해결**:
1. Vercel 환경 변수 확인:
   - `NEXT_PUBLIC_SITE_URL = https://content.foreverlove.co.kr`
2. 재배포 (환경 변수 변경 시 필수):
   ```bash
   git commit --allow-empty -m "환경 변수 갱신 트리거"
   git push
   ```
3. ISR 캐시 수동 갱신:
   ```bash
   curl -X PURGE https://content.foreverlove.co.kr/sitemap.xml
   ```

---

### 문제 6: 스크립트 실행 시 "파일이 없습니다" 에러

**증상**:
```
⚠️  layout.tsx 파일이 없습니다. 건너뜀.
```

**원인**:
- 프로젝트 루트 디렉토리가 아닌 곳에서 실행
- 파일 경로 오류

**해결**:
1. 프로젝트 루트로 이동:
   ```bash
   cd /Users/jangjiho/workspace/notion-cms
   ```
2. 스크립트 재실행:
   ```bash
   npm run migrate:subdomain
   ```

---

### 문제 7: 스크립트 실행 권한 에러

**증상**:
```
Permission denied: scripts/subdomain-migration.ts
```

**해결**:
```bash
chmod +x scripts/subdomain-migration.ts
npm run migrate:subdomain
```

---

## 체크리스트

### Phase 1: DNS 설정 ✅

- [ ] 도메인 등록업체 관리 페이지 접속
- [ ] CNAME 레코드 추가
  - [ ] Type: CNAME
  - [ ] Host: `content`
  - [ ] Value: `cname.vercel-dns.com.` (끝에 `.` 필수)
  - [ ] TTL: 3600
- [ ] DNS 전파 확인
  - [ ] `nslookup content.foreverlove.co.kr` 성공
  - [ ] Vercel IP 주소 표시 (`76.76.x.x`)

### Phase 2: 스크립트 실행 ✅

- [ ] 프로젝트 루트 디렉토리 이동
- [ ] 스크립트 미리보기 실행 (`--preview`)
- [ ] 변경 사항 확인
- [ ] 스크립트 실행 (`npm run migrate:subdomain`)
- [ ] 백업 파일 생성 확인
  - [ ] `.env.local.backup`
  - [ ] `layout.tsx.backup`
  - [ ] `sitemap.ts.backup`
  - [ ] `robots.ts.backup`
- [ ] 변경 파일 확인
  - [ ] `.env.local`
  - [ ] `src/app/layout.tsx`
  - [ ] `src/app/sitemap.ts`
  - [ ] `src/app/robots.ts`
  - [ ] `vercel.json` (신규 생성)

### Phase 3: Vercel 설정 ✅

- [ ] Vercel Dashboard 접속
- [ ] Domains 메뉴에서 도메인 추가
  - [ ] `content.foreverlove.co.kr` 입력
- [ ] 도메인 검증 성공
  - [ ] 녹색 체크 표시 (`Valid Configuration`)
  - [ ] SSL 활성화 (`SSL: Active`)
- [ ] Environment Variables 업데이트
  - [ ] `NEXT_PUBLIC_SITE_URL = https://content.foreverlove.co.kr`
  - [ ] Production, Preview, Development 모두 체크

### Phase 4: 배포 및 검증 ✅

- [ ] Git 커밋 및 푸시
  - [ ] `git add .env.local src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts vercel.json`
  - [ ] `git commit -m "서브도메인 전환 완료"`
  - [ ] `git push`
- [ ] Vercel 자동 배포 완료 확인 (2~3분)
- [ ] 새 도메인 접속 테스트
  - [ ] https://content.foreverlove.co.kr (200 OK)
  - [ ] https://content.foreverlove.co.kr/tutorials (200 OK)
  - [ ] https://content.foreverlove.co.kr/combos (200 OK)
- [ ] 기존 도메인 리다이렉트 테스트
  - [ ] https://pressco21.vercel.app → https://content.foreverlove.co.kr (301)
- [ ] SSL 인증서 확인
  - [ ] 브라우저 자물쇠 아이콘 표시
  - [ ] Let's Encrypt 인증서
- [ ] sitemap.xml 확인
  - [ ] https://content.foreverlove.co.kr/sitemap.xml
  - [ ] URL이 모두 새 도메인으로 표시됨
- [ ] robots.txt 확인
  - [ ] https://content.foreverlove.co.kr/robots.txt
  - [ ] Sitemap URL이 새 도메인으로 표시됨

### Phase 5: SEO 설정 (선택) ✅

- [ ] Google Search Console에 서브도메인 등록
  - [ ] 속성 추가: `https://content.foreverlove.co.kr`
  - [ ] 소유권 확인
- [ ] 사이트맵 제출
  - [ ] `https://content.foreverlove.co.kr/sitemap.xml` 제출
- [ ] Naver Search Advisor 등록 (선택)
  - [ ] 사이트 등록
  - [ ] 사이트맵 제출

---

## FAQ

### Q1. 스크립트를 실행하면 기존 사이트가 다운되나요?

**A**: 아니요. 스크립트는 로컬 파일만 수정하며, Git push 전까지는 프로덕션에 영향을 주지 않습니다.

---

### Q2. DNS 전파 중에도 기존 도메인으로 접속할 수 있나요?

**A**: 네, 가능합니다. DNS 전파 중에도 `pressco21.vercel.app`는 정상 작동합니다.

---

### Q3. 롤백하면 백업 파일도 삭제되나요?

**A**: 아니요. 백업 파일은 롤백 후에도 남아 있습니다. 수동으로 삭제하거나 `--clean` 옵션을 사용하세요.

---

### Q4. 스크립트를 여러 번 실행해도 되나요?

**A**: 네, 안전합니다. 스크립트는 멱등성(idempotent)을 보장하여 여러 번 실행해도 동일한 결과를 냅니다. 단, 백업 파일은 덮어쓰이므로 주의하세요.

---

### Q5. 환경 변수를 Vercel에서 업데이트하면 자동으로 배포되나요?

**A**: 아니요. 환경 변수 변경 후 반드시 재배포가 필요합니다 (`git push` 또는 Vercel Dashboard에서 수동 배포).

---

### Q6. 서브도메인 비용이 추가로 발생하나요?

**A**: 아니요, 무료입니다.
- DNS CNAME 레코드 추가: 무료
- Vercel 커스텀 도메인: 무료 (Hobby 플랜 포함)
- SSL 인증서: 무료 (Let's Encrypt)

---

### Q7. 메이크샵 쇼핑몰에서 콘텐츠 허브로 링크하려면?

**A**: 메이크샵 관리자에서 HTML 편집이 가능하다면:

```html
<!-- 메이크샵 상단 HTML에 추가 -->
<div style="background: #f3f4f6; padding: 12px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
  <a href="https://content.foreverlove.co.kr" target="_blank" style="color: #2563eb; font-weight: 500; text-decoration: none;">
    📚 튜토리얼 보러가기 →
  </a>
</div>
```

상세 가이드: `docs/MAKESHOP-INTEGRATION-STRATEGY.md` 참조

---

### Q8. 나중에 서브도메인 이름을 변경할 수 있나요?

**A**: 네, 가능합니다. 단, SEO에 영향이 있으므로 초기에 신중히 결정하는 것이 좋습니다.

**변경 절차**:
1. 새 CNAME 레코드 추가 (예: `learn.foreverlove.co.kr`)
2. 스크립트 재실행 (NEW_DOMAIN 상수 수정 필요)
3. Vercel에 새 도메인 추가
4. 기존 서브도메인 → 새 서브도메인 301 리다이렉트 설정 (`vercel.json` 수정)
5. 1개월 후 기존 도메인 삭제

---

## 마무리

### 권장 타임라인

| 일정 | 작업 | 담당자 | 소요 시간 |
|------|------|--------|-----------|
| **Day 1 오전** | DNS CNAME 레코드 추가 | 사용자 (도메인 관리자) | 5분 |
| **Day 1~2** | DNS 전파 대기 | 자동 | 1~48시간 |
| **Day 2** | 스크립트 실행 + Vercel 설정 | 사용자 | 15분 |
| **Day 2** | Git 커밋 및 배포 | 사용자 | 10분 |
| **Day 2** | 전체 테스트 | 사용자 | 15분 |
| **Day 3** | SEO 설정 (Google Search Console) | 사용자 | 10분 |

**총 작업 시간**: 55분 (실제 작업)
**총 소요 기간**: 2~3일 (DNS 전파 대기 포함)

---

### 최종 확인 사항

전환 완료 후 다음 사항을 최종 확인하세요:

- ✅ `https://content.foreverlove.co.kr` 접속 정상
- ✅ SSL 인증서 활성화 (자물쇠 아이콘)
- ✅ `https://pressco21.vercel.app` → 서브도메인 리다이렉트 정상
- ✅ sitemap.xml URL이 모두 새 도메인
- ✅ robots.txt sitemap URL이 새 도메인
- ✅ Vercel 환경 변수 업데이트 완료
- ✅ Google Search Console 사이트맵 제출 (선택)

---

### 다음 단계 (선택)

서브도메인 전환 후 추가로 고려할 사항:

1. **메이크샵 네비게이션 통합**
   - 메이크샵 상단/하단 HTML에 콘텐츠 허브 링크 추가
   - 상세: `docs/MAKESHOP-INTEGRATION-STRATEGY.md` Phase 5 참조

2. **Google Analytics 도메인 업데이트**
   - GA4에서 측정 ID 확인
   - 새 도메인 트래킹 설정

3. **SNS 공유 링크 업데이트**
   - Instagram, Facebook 프로필 링크
   - 이메일 서명 링크

4. **명함/인쇄물 URL 업데이트**
   - 기존: `pressco21.vercel.app`
   - 신규: `content.foreverlove.co.kr`

---

### 참고 문서

- **전체 전략**: `docs/MAKESHOP-INTEGRATION-STRATEGY.md`
- **스크립트 소스**: `scripts/subdomain-migration.ts`
- **환경 변수 예시**: `.env.example`

---

### 지원

문제가 발생하거나 추가 도움이 필요하면:

1. **트러블슈팅 섹션 확인**: [트러블슈팅](#트러블슈팅)
2. **전체 전략 문서 확인**: `docs/MAKESHOP-INTEGRATION-STRATEGY.md`
3. **Git 이슈 생성**: 프로젝트 저장소에 이슈 등록

---

**작성일**: 2026-02-12
**버전**: 1.0.0
**작성자**: Claude Sonnet 4.5
**검토자**: (사용자 검토 필요)
