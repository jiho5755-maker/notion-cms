# 서브도메인 전환 실행 가이드

**도메인**: hub.foreverlove.co.kr
**예상 소요 시간**: 6.5시간 (1-2일)
**상태**: 준비 완료 ✅

---

## 📋 사전 체크리스트 (Day 0)

### ✅ 코드 준비 완료
- [x] 환경 변수: `NEXT_PUBLIC_SITE_URL=https://hub.foreverlove.co.kr`
- [x] vercel.json: 301 리다이렉트 설정 완료
- [x] 자동화 스크립트: `scripts/check-dns.sh`, `scripts/verify-deployment.sh`
- [x] SEO 파일: metadataBase, sitemap.ts, robots.ts (환경 변수 기반)

### 📁 필수 문서 준비
- [x] `docs/MAKESHOP-1-1-REQUEST-TEMPLATE.md` - 메이크샵 CNAME 요청 템플릿
- [x] `docs/MAKESHOP-HTML-EDIT-GUIDE.md` - 메이크샵 HTML 편집 가이드
- [x] `docs/SUBDOMAIN-BENEFITS.md` - 서브도메인 전략 분석 자료
- [x] `scripts/check-dns.sh` - DNS 전파 확인 스크립트
- [x] `scripts/verify-deployment.sh` - 배포 검증 스크립트

### 🔑 계정 접근 확인
- [ ] 메이크샵 관리자 로그인 가능 (https://www.foreverlove.co.kr/admin)
- [ ] Vercel 대시보드 접근 가능 (https://vercel.com/)
- [ ] Google Search Console 접근 가능 (https://search.google.com/search-console/)

**⚠️ 계정 접근 확인이 완료되면 Phase 1을 시작하세요.**

---

## 📅 실행 타임라인

```
Day 1 (4시간)
├── Phase 1: 메이크샵 CNAME 요청 (1시간) ← 지금 시작
├── Phase 2: DNS 전파 대기 (1-2시간)
├── Phase 3: Vercel 도메인 검증 (10분)
└── Phase 4: 배포 검증 (20분)

Day 2-3 (2.5시간)
├── Phase 5: 메이크샵 HTML 편집 (2시간)
└── Phase 6: Google Search Console 등록 (30분)
```

---

## Phase 1: 메이크샵 CNAME 요청 (Day 1, 1시간)

### 🎯 목표
메이크샵에 `hub.foreverlove.co.kr` CNAME 레코드 추가 요청

### 📋 작업 단계

#### Step 1: 메이크샵 관리자 로그인
1. https://www.foreverlove.co.kr/admin 접속
2. 관리자 계정 로그인

#### Step 2: 1:1 문의 작성
1. 경로: **고객센터 → 1:1 문의** (또는 우측 상단 "문의하기")
2. 제목: **"서브도메인 hub.foreverlove.co.kr CNAME 레코드 추가 요청"**
3. 내용: `docs/MAKESHOP-1-1-REQUEST-TEMPLATE.md` 전체 복사 및 붙여넣기

**📄 템플릿 미리보기:**
```
안녕하세요. 포에버러브(www.foreverlove.co.kr) 운영자입니다.

콘텐츠 허브 분리 운영을 위해 서브도메인 CNAME 레코드 추가를 요청드립니다.

[요청 정보]
- 서브도메인: hub.foreverlove.co.kr
- 레코드 타입: CNAME
- 레코드 값: cname.vercel-dns.com
- 목적: 압화 튜토리얼/FAQ/견적서 콘텐츠 허브 운영

... (전체 내용은 템플릿 파일 참조)
```

#### Step 3: 문의 제출 및 확인
1. "문의하기" 버튼 클릭
2. 제출 확인 메시지 확인
3. 답변 알림 설정 (이메일 또는 SMS)

#### Step 4: (옵션) 전화 문의
- **전화번호**: 02-2026-2300
- **운영 시간**: 평일 09:00-18:00
- **멘트**: "서브도메인 CNAME 레코드 추가 요청 드렸는데, 진행 가능한지 확인 부탁드립니다."

### ✅ 성공 기준
- [ ] 메이크샵 1:1 문의 제출 완료
- [ ] "접수되었습니다" 확인 메시지 수신
- [ ] 1-2영업일 내 답변 대기

### ⏱️ 예상 시간
- 작업: 1시간
- 대기: 1-2영업일

### ⚠️ 문제 발생 시 대응

**시나리오 A: "CNAME 추가 불가" 답변**
→ 대안: 네임서버를 가비아로 변경 후 직접 CNAME 추가
→ 가이드: `docs/ALTERNATIVE-DNS-SETUP.md` (필요 시 생성)

**시나리오 B: 무응답 (3영업일 경과)**
→ 전화 문의: 02-2026-2300
→ 또는 독립 도메인(pressco21.com) 사용 고려

---

## Phase 2: DNS 전파 대기 및 검증 (Day 1, 1-2시간)

### 🎯 목표
메이크샵 CNAME 추가 완료 → DNS 전파 확인

### 📋 작업 단계

#### Step 1: 메이크샵 "CNAME 추가 완료" 회신 대기
- 메이크샵으로부터 "CNAME 레코드가 추가되었습니다" 회신 수신
- 예상 시간: 1-2영업일

#### Step 2: 자동 DNS 검증 스크립트 실행
```bash
cd /Users/jangjiho/workspace/notion-cms
./scripts/check-dns.sh
```

**스크립트 동작:**
- 10분마다 DNS 전파 상태 확인
- 성공 시 자동 종료
- 실패 시 재시도 안내

**예상 출력:**
```
🔍 DNS 전파 상태 확인 중...

[1/3] nslookup hub.foreverlove.co.kr
✅ Address: 76.76.21.21 (Vercel IP)

[2/3] dig hub.foreverlove.co.kr CNAME
✅ CNAME: cname.vercel-dns.com

[3/3] dnschecker.org (10개 지역)
✅ 전 세계 DNS 서버 전파 완료

🎉 DNS 전파 완료! Phase 3로 진행하세요.
```

#### Step 3: (옵션) 수동 검증
```bash
# CNAME 레코드 확인
dig hub.foreverlove.co.kr CNAME +short
# 예상: cname.vercel-dns.com

# IP 주소 확인
nslookup hub.foreverlove.co.kr
# 예상: Address: 76.76.21.21
```

#### Step 4: 웹 도구 확인
1. https://dnschecker.org/#CNAME/hub.foreverlove.co.kr 접속
2. 전 세계 10개 이상 지역에서 동일 결과 확인
3. 모두 `cname.vercel-dns.com` 표시 확인

### ✅ 성공 기준
- [ ] `./scripts/check-dns.sh` 실행 → ✅ 성공
- [ ] CNAME 레코드: `cname.vercel-dns.com`
- [ ] 전 세계 10개 이상 DNS 서버 전파 완료
- [ ] NXDOMAIN 에러 없음

### ⏱️ 예상 시간
- 일반: 10-30분
- 지연: 1-2시간

### ⚠️ 문제 발생 시 대응

**증상: NXDOMAIN 에러 지속 (1시간 경과)**
```bash
# Tier 1: 로컬 DNS 캐시 클리어
sudo dscacheutil -flushcache

# Tier 2: 10분 후 재확인
./scripts/check-dns.sh

# Tier 3: 메이크샵 재확인
# → 1:1 문의: "CNAME 레코드 값이 정확한지 확인 부탁드립니다."
```

**롤백 조건:**
- 24시간 경과해도 DNS 전파 실패 시
- → 대안 시나리오 A (네임서버 변경)

---

## Phase 3: Vercel 도메인 추가 및 검증 (Day 1, 10분)

### 🎯 목표
Vercel에서 `hub.foreverlove.co.kr` 도메인 추가 및 SSL 발급

### 📋 작업 단계

#### Step 1: Vercel 대시보드 접속
1. https://vercel.com/ 로그인
2. 프로젝트 선택: `notion-cms` (또는 현재 프로젝트명)

#### Step 2: 도메인 추가
1. **Settings → Domains** 클릭
2. **"Add Domain"** 버튼 클릭
3. 입력: `hub.foreverlove.co.kr`
4. **"Add"** 버튼 클릭

#### Step 3: DNS 검증 대기
- Vercel이 자동으로 DNS 확인
- 상태 변경: "Pending" → "Valid Configuration" ✅
- 예상 시간: 10-60초

#### Step 4: SSL 인증서 발급 대기
- Let's Encrypt 자동 발급
- 상태: "Certificate pending" → "Valid" ✅
- 예상 시간: 5-10분

#### Step 5: Primary Domain 설정
1. `hub.foreverlove.co.kr` 우측 **"⋯"** 클릭
2. **"Set as Primary Domain"** 선택
3. 확인 팝업: **"Set as Primary"** 클릭

#### Step 6: 기존 도메인 자동 리다이렉트 확인
- `pressco21.vercel.app` 상태 확인
- 표시: "Redirects to hub.foreverlove.co.kr" ✅

### ✅ 성공 기준
- [ ] Vercel: "Valid Configuration" ✅
- [ ] SSL 상태: "Valid (Let's Encrypt)"
- [ ] Primary Domain 설정 완료
- [ ] 기존 도메인: "Redirects to Primary"

### 📸 예상 화면
```
Domains

✅ hub.foreverlove.co.kr (Primary)
   SSL: Valid (Let's Encrypt)
   Added: 2026-02-11

⚠️  pressco21.vercel.app
   Redirects to: hub.foreverlove.co.kr
   Type: 301 Permanent
```

### ⏱️ 예상 시간
10분

### ⚠️ 문제 발생 시 대응

**증상: "Invalid Configuration" 에러**
→ DNS 전파 재확인: `./scripts/check-dns.sh`

**증상: "Certificate pending" 지속 (30분 경과)**
```
Tier 1: "Refresh" 버튼 클릭 (5분마다 반복)
Tier 2: DNS 전파 재확인 (dig, nslookup)
Tier 3: Vercel Support 문의 (Chat)
```

**롤백 조건:**
- 48시간 경과해도 SSL 발급 실패 시
- → 도메인 제거 후 재추가

---

## Phase 4: 배포 검증 (Day 1, 20분)

### 🎯 목표
전체 시스템 동작 확인 (7가지 항목)

### 📋 작업 단계

#### Step 1: 자동 검증 스크립트 실행
```bash
cd /Users/jangjiho/workspace/notion-cms
./scripts/verify-deployment.sh
```

**검증 항목:**
```
1️⃣  DNS 전파 확인
2️⃣  HTTP 접속 확인 (HTTP 200)
3️⃣  SSL 인증서 확인
4️⃣  리다이렉트 확인 (pressco21.vercel.app → hub)
5️⃣  주요 페이지 확인 (/, /tutorials, /combos, /seasons, /faq, /quotation)
6️⃣  sitemap.xml 확인 (13개 URL)
7️⃣  robots.txt 확인
```

**예상 출력:**
```
🚀 배포 검증 시작...

✅ [1/7] DNS 전파 확인 - CNAME: cname.vercel-dns.com
✅ [2/7] HTTP 접속 확인 - 200 OK
✅ [3/7] SSL 인증서 확인 - Valid (Let's Encrypt)
✅ [4/7] 리다이렉트 확인 - 301 → hub.foreverlove.co.kr
✅ [5/7] 주요 페이지 확인 - 6/6 페이지 정상
✅ [6/7] sitemap.xml 확인 - 13개 URL
✅ [7/7] robots.txt 확인 - 정상

🎉 배포 검증 완료! 모든 테스트 통과.
```

#### Step 2: 수동 브라우저 확인

**테스트 시나리오:**
1. https://hub.foreverlove.co.kr 접속
2. SSL 자물쇠 아이콘 확인 (주소창 좌측 🔒)
3. 메인 페이지 렌더링: 3 튜토리얼, 2 조합, 1 시즌 표시
4. 네비게이션 클릭:
   - **튜토리얼** → `/tutorials` 정상 표시
   - **재료 조합** → `/combos` 정상 표시
   - **시즌 캠페인** → `/seasons` 정상 표시
   - **견적서** → `/quotation` 정상 표시
5. Footer 링크 클릭:
   - **🛍️ 쇼핑몰** → `www.foreverlove.co.kr` 이동
   - **About** → `/about` 정상 표시
   - **이용약관** → `/terms` 정상 표시
   - **개인정보처리방침** → `/privacy` 정상 표시

#### Step 3: 리다이렉트 테스트
1. https://pressco21.vercel.app 접속
2. 자동 리다이렉트 → `hub.foreverlove.co.kr` 확인
3. 주소창 URL 변경 확인 (301 Permanent)

#### Step 4: 모바일 반응형 확인
1. Chrome 개발자 도구 → Device Mode (Cmd+Shift+M)
2. iPhone 14 Pro (390x844) 선택
3. 메인 페이지 렌더링 확인
4. 네비게이션 햄버거 메뉴 동작 확인

### ✅ 성공 기준
- [ ] 7가지 자동 검증 항목 모두 통과
- [ ] 브라우저 접속 정상 (SSL 🔒)
- [ ] 모든 주요 페이지 렌더링 확인
- [ ] 301 리다이렉트 동작 확인
- [ ] 모바일 반응형 정상

### ⏱️ 예상 시간
20분

### ⚠️ 문제 발생 시 대응

**증상: 특정 페이지 404 에러**
→ sitemap.xml 확인: `curl https://hub.foreverlove.co.kr/sitemap.xml`
→ Vercel 배포 로그 확인: Settings → Deployments

**증상: SSL 경고 표시 (자물쇠 아이콘 없음)**
→ SSL 인증서 재확인: Vercel → Domains → SSL 상태
→ 브라우저 캐시 클리어 (Cmd+Shift+R)

---

## Phase 5: 메이크샵 네비게이션 통합 (Day 2-3, 2시간)

### 🎯 목표
메이크샵 쇼핑몰 헤더에 콘텐츠 허브 링크 추가

### 📋 작업 단계

#### Step 1: 메이크샵 관리자 로그인
1. https://www.foreverlove.co.kr/admin 접속
2. 관리자 계정 로그인

#### Step 2: HTML 편집 페이지 이동
1. 좌측 메뉴: **디자인 설정 → HTML/CSS 편집**
2. 탭: **공통 레이아웃**
3. 파일: **상단 HTML** 선택

#### Step 3: HTML 삽입
1. `docs/MAKESHOP-HTML-EDIT-GUIDE.md` 파일 열기
2. **옵션 1: 단일 링크 배너** HTML 전체 복사
3. `<body>` 태그 직후 또는 `<header>` 태그 직후에 붙여넣기

**삽입할 HTML (요약):**
```html
<!-- PRESSCO 21 콘텐츠 허브 링크 -->
<div class="pressco-hub-banner">
  <a href="https://hub.foreverlove.co.kr" target="_blank" rel="noopener noreferrer">
    📚 압화 튜토리얼 · FAQ · 견적서 보러가기 →
  </a>
</div>

<style>
/* 배너 스타일 */
.pressco-hub-banner {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 12px 20px;
  text-align: center;
  border-bottom: 1px solid #d1d5db;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.pressco-hub-banner a {
  color: #2563eb;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.pressco-hub-banner a:hover {
  color: #1d4ed8;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .pressco-hub-banner {
    padding: 10px 15px;
  }
  .pressco-hub-banner a {
    font-size: 13px;
  }
}
</style>
```

#### Step 4: 저장 및 미리보기
1. **"저장"** 버튼 클릭
2. **"미리보기"** 버튼 클릭
3. 새 탭에서 www.foreverlove.co.kr 열림 확인

#### Step 5: 배너 동작 확인
1. 헤더 아래에 배너 표시 확인
2. 배너 클릭 → `hub.foreverlove.co.kr` 이동 확인
3. 새 탭에서 열림 확인 (`target="_blank"`)

#### Step 6: 모바일 반응형 확인
1. Chrome 개발자 도구 → Device Mode
2. iPhone 선택 (375px)
3. 배너 레이아웃 확인 (텍스트 줄바꿈 없음)

### ✅ 성공 기준
- [ ] 메이크샵 상단 HTML 편집 완료
- [ ] 배너가 헤더 아래에 표시
- [ ] 링크 클릭 → hub.foreverlove.co.kr 이동
- [ ] 새 탭에서 열림 (`target="_blank"`)
- [ ] 모바일 반응형 정상 (375px~768px)

### ⏱️ 예상 시간
1-2시간

### ⚠️ 문제 발생 시 대응

**증상: 배너가 표시되지 않음**
→ HTML 삽입 위치 확인 (`<body>` 태그 직후)
→ 브라우저 캐시 클리어 (Cmd+Shift+R)

**증상: 스타일이 깨짐 (기존 쇼핑몰 CSS와 충돌)**
→ 클래스명 변경: `.pressco-hub-banner` → `.my-custom-banner-12345`
→ `!important` 플래그 추가

---

## Phase 6: Google Search Console 등록 (Day 2-3, 30분)

### 🎯 목표
Google에 새 도메인 알림 및 색인 생성 시작

### 📋 작업 단계

#### Step 1: Google Search Console 로그인
1. https://search.google.com/search-console/ 접속
2. Google 계정 로그인

#### Step 2: 속성 추가
1. 좌측 상단 드롭다운 → **"속성 추가"** 클릭
2. **"URL 접두어"** 선택 (권장)
3. 입력: `https://hub.foreverlove.co.kr`
4. **"계속"** 클릭

#### Step 3: 소유권 확인 (HTML 파일 업로드 권장)
1. **"HTML 파일"** 탭 선택
2. Google 제공 파일 다운로드 (예: `google1234567890abcdef.html`)
3. 파일을 프로젝트 `public/` 폴더에 복사
4. Vercel 재배포:
   ```bash
   cd /Users/jangjiho/workspace/notion-cms
   git add public/google*.html
   git commit -m "chore: Google Search Console 소유권 확인 파일 추가"
   git push
   ```
5. 배포 완료 대기 (1-2분)
6. Google Search Console: **"확인"** 버튼 클릭

#### Step 4: 소유권 확인 완료
- 상태: "소유권 확인됨" ✅
- 예상 시간: 10초 이내

#### Step 5: sitemap.xml 제출
1. 좌측 메뉴: **Sitemaps** 클릭
2. "새 사이트맵 추가" 입력: `sitemap.xml`
3. **"제출"** 버튼 클릭
4. 상태 확인: "성공" ✅

#### Step 6: URL 검사 (선택)
1. 좌측 메뉴: **URL 검사** 클릭
2. 입력: `https://hub.foreverlove.co.kr` (홈)
3. **"색인 생성 요청"** 클릭
4. 주요 페이지 반복:
   - `/tutorials`
   - `/combos`
   - `/seasons`
   - `/quotation`

### ✅ 성공 기준
- [ ] 속성 추가 완료
- [ ] 소유권 확인 완료
- [ ] sitemap.xml 제출 "성공" 상태
- [ ] URL 검사 "색인 생성 요청" 완료 (4-5개 페이지)

### 📊 예상 결과 (1주 후)
```
[Google Search Console]
속성: hub.foreverlove.co.kr ✅
총 페이지: 13개
색인 생성: 3 → 7 → 13개 (점진적 증가)

[Google 검색]
site:hub.foreverlove.co.kr
→ 약 3-5개 결과 (1주 후)
→ 약 13개 결과 (2주 후)
```

### ⏱️ 예상 시간
30분

### ⚠️ 문제 발생 시 대응

**증상: 소유권 확인 실패**
→ HTML 파일 접속 확인: `curl https://hub.foreverlove.co.kr/google*.html`
→ Vercel 배포 로그 확인 (파일 업로드 누락)

**증상: sitemap.xml 제출 오류**
→ sitemap.xml 접속 확인: `curl https://hub.foreverlove.co.kr/sitemap.xml`
→ XML 형식 검증: https://www.xml-sitemaps.com/validate-xml-sitemap.html

---

## ✅ 최종 체크리스트

### Phase 1: 메이크샵 CNAME 요청
- [ ] 메이크샵 1:1 문의 제출 완료
- [ ] 메이크샵 "CNAME 추가 완료" 회신 수신

### Phase 2: DNS 전파
- [ ] `./scripts/check-dns.sh` 실행 → ✅ 성공
- [ ] `nslookup hub.foreverlove.co.kr` → Vercel IP
- [ ] dnschecker.org → 전 세계 10개 지역 확인

### Phase 3: Vercel 도메인
- [ ] Vercel Domains: `hub.foreverlove.co.kr` 추가
- [ ] 상태: "Valid Configuration" ✅
- [ ] SSL: "Valid (Let's Encrypt)"
- [ ] Primary Domain 설정 완료

### Phase 4: 배포 검증
- [ ] `./scripts/verify-deployment.sh` → 7가지 통과
- [ ] https://hub.foreverlove.co.kr 브라우저 접속 정상
- [ ] pressco21.vercel.app → 301 리다이렉트 동작

### Phase 5: 메이크샵 통합
- [ ] 메이크샵 헤더 배너 추가 완료
- [ ] 배너 클릭 → hub.foreverlove.co.kr 이동
- [ ] 모바일 반응형 확인

### Phase 6: Google Search Console
- [ ] 속성 추가 완료
- [ ] 소유권 확인 완료
- [ ] sitemap.xml 제출 "성공" 상태

### 최종 확인
- [ ] 양방향 링크 동작 (쇼핑몰 ↔ 콘텐츠 허브)
- [ ] SSL 인증서 정상 (🔒)
- [ ] 모든 주요 페이지 접속 가능
- [ ] Google 검색 색인 생성 진행 중 (1-2주 대기)

---

## 📞 지원 연락처

### 메이크샵
- **고객센터**: 02-2026-2300 (평일 09:00-18:00)
- **1:1 문의**: https://www.foreverlove.co.kr/admin

### Vercel
- **Dashboard**: https://vercel.com/
- **Chat Support**: Dashboard → Help → Chat

### Google Search Console
- **URL**: https://search.google.com/search-console/

---

## 🎉 완료 후 다음 단계

### 즉시 (Phase 완료 후)
1. ✅ 양방향 링크 동작 확인 (쇼핑몰 ↔ 콘텐츠 허브)
2. ✅ Google Analytics 연동 확인 (트래픽 추적)
3. ✅ Vercel Analytics 모니터링 (성능 지표)

### 1주 후
1. Google Search Console: 색인 생성 상태 확인 (3-5개 URL 예상)
2. Google 검색 테스트: `site:hub.foreverlove.co.kr`

### 2주 후
1. Google 검색: 13개 URL 전체 색인 확인
2. 오가닉 트래픽 분석 (Google Analytics)

### 1개월 후
1. KPI 측정 (DNS 100%, 색인 10개 이상, 오가닉 트래픽 200명 이상)
2. 콘텐츠 → 구매 전환율 분석

---

**작성일**: 2026-02-11
**버전**: 1.0
**상태**: 준비 완료 ✅
