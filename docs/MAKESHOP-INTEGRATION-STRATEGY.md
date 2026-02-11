# 메이크샵 통합 전략 문서

> PRESSCO 21 프로젝트 — 메이크샵 호스팅 + Next.js 콘텐츠 허브 도메인 통합
> 작성일: 2026-02-11
> 작성자: Claude Sonnet 4.5

---

## 목차

1. [현재 상황](#현재-상황)
2. [통합 방안 비교](#통합-방안-비교)
3. [권장 방안: 서브도메인 (CNAME)](#권장-방안-서브도메인-cname)
4. [구현 가이드 (6 Phases)](#구현-가이드-6-phases)
5. [네비게이션 통합](#네비게이션-통합)
6. [대안: 현재 상태 유지 + UX 개선](#대안-현재-상태-유지--ux-개선)
7. [트러블슈팅](#트러블슈팅)
8. [FAQ](#faq)

---

## 현재 상황

### 도메인 구조

```
www.foreverlove.co.kr      → 메이크샵 호스팅 (쇼핑몰)
pressco21.vercel.app       → Vercel 호스팅 (콘텐츠 허브)
```

### 역할 분담

| 서비스 | 호스팅 | 역할 | 주요 기능 |
|--------|--------|------|-----------|
| **메이크샵** | www.foreverlove.co.kr | 쇼핑몰 | 상품 판매, 주문/결제, 회원 관리 |
| **Next.js** | pressco21.vercel.app | 콘텐츠 허브 | 튜토리얼, FAQ, 견적서, 고객 관리 |

### 연동 현황

- **완전 분리**: 두 시스템은 독립적으로 운영
- **API 연동**: 메이크샵 Open API로 상품/주문 데이터만 조회 (읽기 전용)
- **데이터 흐름**: 메이크샵 → Next.js (단방향)

---

## 통합 방안 비교

### 방안 1: 서브도메인 (CNAME) ✅ 권장

**최종 구조**:
```
www.foreverlove.co.kr      → 메이크샵 (쇼핑몰)
content.foreverlove.co.kr  → Vercel (콘텐츠 허브)
```

**장점**:
- ✅ **SEO 최적화**: 동일 루트 도메인으로 검색 엔진 권위도 공유
- ✅ **자연스러운 UX**: 서브도메인 인식 낮음 (일반 사용자는 동일 사이트로 인식)
- ✅ **구현 간편**: DNS CNAME 레코드만 추가 (30분)
- ✅ **비용 무료**: 추가 서버 비용 없음
- ✅ **SSL 자동**: Vercel에서 Let's Encrypt 인증서 자동 발급

**단점**:
- ❌ 네비게이션 통합 어려움 (메이크샵 HTML 편집 필요)
- ❌ 로그인 세션 미공유 (일반적으로 문제 없음)

**난이도**: ⭐⭐ (낮음)
**예상 시간**: 4시간 15분

---

### 방안 2: 리버스 프록시 (Next.js에서 메이크샵 통합)

**최종 구조**:
```
www.foreverlove.co.kr      → Vercel (메인)
www.foreverlove.co.kr/shop → 메이크샵으로 프록시
```

**장점**:
- ✅ 단일 도메인 (완벽한 통합 UX)
- ✅ 네비게이션 통합 용이

**단점**:
- ❌ **복잡도 높음**: Next.js `rewrites`로 메이크샵 경로 프록시 필요
- ❌ **성능 저하**: 모든 요청이 Vercel 경유
- ❌ **메이크샵 제약**: 경로 변경 시 메이크샵 내부 링크 깨짐 가능성
- ❌ **유지보수 어려움**: 메이크샵 업데이트 시 대응 필요

**난이도**: ⭐⭐⭐⭐ (높음)
**예상 시간**: 16시간

---

### 방안 3: 현재 상태 유지 (분리 운영)

**최종 구조**:
```
www.foreverlove.co.kr      → 메이크샵 (쇼핑몰)
pressco21.vercel.app       → Vercel (콘텐츠 허브)
```

**장점**:
- ✅ 안정적 (변경 없음)
- ✅ 구현 불필요

**단점**:
- ❌ SEO 분산 (도메인 권위도 분리)
- ❌ 사용자 혼란 (도메인 다름)
- ❌ 브랜드 일관성 부족

**난이도**: ⭐ (없음)
**예상 시간**: 0시간

---

### 최종 권장: 방안 1 (서브도메인)

**이유**:
1. **비용 효율**: 추가 비용 없음
2. **구현 용이**: DNS 설정만으로 완료
3. **SEO 개선**: 동일 루트 도메인
4. **안정성**: 각 시스템 독립 운영 (장애 격리)
5. **확장성**: 향후 `api.foreverlove.co.kr`, `blog.foreverlove.co.kr` 등 추가 가능

---

## 권장 방안: 서브도메인 (CNAME)

### 최종 도메인 구조

```
foreverlove.co.kr
├── www.foreverlove.co.kr      → 메이크샵 쇼핑몰
├── content.foreverlove.co.kr  → Vercel 콘텐츠 허브
└── (향후) api.foreverlove.co.kr → API 서버 (옵션)
```

### 서브도메인 이름 후보

| 이름 | URL | 설명 | 권장도 |
|------|-----|------|--------|
| **content** | `content.foreverlove.co.kr` | 콘텐츠 허브 (명확) | ⭐⭐⭐⭐⭐ |
| **learn** | `learn.foreverlove.co.kr` | 학습/튜토리얼 (교육 강조) | ⭐⭐⭐⭐ |
| **hub** | `hub.foreverlove.co.kr` | 허브 (간결) | ⭐⭐⭐ |
| **support** | `support.foreverlove.co.kr` | 고객 지원 (문의 강조) | ⭐⭐⭐ |
| **academy** | `academy.foreverlove.co.kr` | 아카데미 (전문성) | ⭐⭐⭐ |

**최종 권장**: `content.foreverlove.co.kr` (명확하고 직관적)

---

## 구현 가이드 (6 Phases)

### Phase 1: DNS 설정 (30분)

#### 1.1 도메인 등록업체 관리 페이지 접속

- **가비아**: https://domain.gabia.com/
- **후이즈**: https://whois.co.kr/
- **카페24**: https://www.cafe24.com/

#### 1.2 DNS 레코드 추가

```
Type: CNAME
Host/Name: content
Value/Target: cname.vercel-dns.com.
TTL: 3600 (1시간)
```

**주의사항**:
- `Host` 필드에는 `content`만 입력 (전체 도메인 아님)
- `Value` 끝에 `.` (점) 필수
- TTL은 3600초 (1시간) 권장

#### 1.3 DNS 전파 대기

- 일반적으로 1~2시간 소요
- 최대 48시간 소요 가능 (드물게)
- DNS 전파 확인 도구:
  - https://dnschecker.org/
  - 명령어: `nslookup content.foreverlove.co.kr`

**DNS 전파 확인 예시**:
```bash
$ nslookup content.foreverlove.co.kr

Non-authoritative answer:
Name:    content.foreverlove.co.kr
Address: 76.76.21.21  # Vercel IP
```

---

### Phase 2: Vercel 도메인 추가 (10분)

#### 2.1 Vercel Dashboard 접속

1. https://vercel.com/ 로그인
2. PRESSCO 21 프로젝트 선택
3. **Settings** → **Domains** 메뉴

#### 2.2 커스텀 도메인 추가

1. **Add** 버튼 클릭
2. `content.foreverlove.co.kr` 입력
3. **Add** 클릭

#### 2.3 도메인 검증 대기

- Vercel이 자동으로 DNS 레코드 확인
- 녹색 체크 표시 나타나면 성공
- SSL 인증서 자동 발급 (Let's Encrypt)

**검증 성공 화면**:
```
✅ content.foreverlove.co.kr
   Valid Configuration
   SSL: Active
```

---

### Phase 3: 환경 변수 업데이트 (5분)

#### 3.1 `.env.local` 수정

```env
# 기존
NEXT_PUBLIC_SITE_URL=https://pressco21.vercel.app

# 변경
NEXT_PUBLIC_SITE_URL=https://content.foreverlove.co.kr
```

#### 3.2 Vercel 환경 변수 업데이트

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. `NEXT_PUBLIC_SITE_URL` 수정
3. **Production**, **Preview**, **Development** 모두 체크
4. **Save** 클릭

#### 3.3 재배포

```bash
git add .env.local
git commit -m "환경 변수: 서브도메인 업데이트"
git push
```

---

### Phase 4: 메타데이터 업데이트 (30분)

#### 4.1 `layout.tsx` — `metadataBase` 업데이트

```typescript
// src/app/layout.tsx

export const metadata: Metadata = {
  metadataBase: new URL("https://content.foreverlove.co.kr"), // 변경
  title: {
    default: "PRESSCO 21 — 꽃으로 노는 모든 방법",
    template: "%s | PRESSCO 21",
  },
  // ...
};
```

#### 4.2 `sitemap.ts` — URL 업데이트

```typescript
// src/app/sitemap.ts

import type { MetadataRoute } from "next";

const BASE_URL = "https://content.foreverlove.co.kr"; // 변경

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    // ...
  ];
}
```

#### 4.3 `robots.ts` — 서브도메인 허용

```typescript
// src/app/robots.ts

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://content.foreverlove.co.kr/sitemap.xml", // 변경
  };
}
```

#### 4.4 빌드 및 배포

```bash
npm run build  # 로컬 검증
git add src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts
git commit -m "메타데이터: 서브도메인 업데이트"
git push
```

---

### Phase 5: 네비게이션 통합 (2시간)

#### 5.1 Next.js Header에 쇼핑몰 링크 추가

```typescript
// src/components/layout/header.tsx

const navigation = [
  { name: "쇼핑몰", href: "https://www.foreverlove.co.kr", external: true },
  { name: "튜토리얼", href: "/tutorials" },
  { name: "FAQ", href: "/faq" },
  { name: "견적서", href: "/quotation" },
];

export function Header() {
  return (
    <nav>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
```

#### 5.2 메이크샵 상단 HTML 편집

**메이크샵 관리자 경로**:
```
관리자 → 디자인 설정 → HTML/CSS 편집 → 공통 레이아웃 → 상단 HTML
```

**추가할 HTML**:
```html
<!-- PRESSCO 21 콘텐츠 허브 링크 -->
<div class="content-hub-banner">
  <a href="https://content.foreverlove.co.kr" target="_blank">
    📚 튜토리얼 보러가기 →
  </a>
</div>

<style>
.content-hub-banner {
  background: #f3f4f6;
  padding: 12px 20px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.content-hub-banner a {
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;
}

.content-hub-banner a:hover {
  text-decoration: underline;
}
</style>
```

**위치**: 상단 헤더 바로 위

---

### Phase 6: 리다이렉트 설정 (1시간)

#### 6.1 `vercel.json` 생성

```json
{
  "redirects": [
    {
      "source": "/",
      "has": [
        {
          "type": "host",
          "value": "pressco21.vercel.app"
        }
      ],
      "destination": "https://content.foreverlove.co.kr",
      "permanent": true
    }
  ]
}
```

**설명**:
- 기존 `pressco21.vercel.app` 접속 시 자동으로 `content.foreverlove.co.kr`로 301 리다이렉트
- SEO에 유리 (영구 리다이렉트)

#### 6.2 배포

```bash
git add vercel.json
git commit -m "리다이렉트: 기존 Vercel 도메인 → 서브도메인"
git push
```

---

## 네비게이션 통합

### 전략: 양방향 링크

```
메이크샵 (www.foreverlove.co.kr)
    ↓ 상단 배너: "📚 튜토리얼 보러가기"
Next.js (content.foreverlove.co.kr)
    ↓ 헤더: "쇼핑몰"
메이크샵 (www.foreverlove.co.kr)
```

### 상세 링크 구조

#### Next.js Header

```
Logo | 쇼핑몰 | 튜토리얼 | 조합 가이드 | 시즌 | FAQ | 견적서
```

- **쇼핑몰**: `https://www.foreverlove.co.kr` (새 탭)
- **튜토리얼**: `/tutorials`
- **조합 가이드**: `/combos`
- **시즌**: `/seasons`
- **FAQ**: `/faq`
- **견적서**: `/quotation`

#### 메이크샵 상단 배너

```html
<!-- 옵션 1: 단일 링크 -->
<a href="https://content.foreverlove.co.kr">
  📚 압화 튜토리얼 · FAQ · 견적서 보러가기 →
</a>

<!-- 옵션 2: 다중 링크 -->
<div class="content-links">
  <a href="https://content.foreverlove.co.kr/tutorials">튜토리얼</a>
  <a href="https://content.foreverlove.co.kr/faq">FAQ</a>
  <a href="https://content.foreverlove.co.kr/quotation">견적서</a>
</div>
```

---

### 제품 상세 페이지 연동

**메이크샵 상품 상세 페이지**에 관련 튜토리얼 링크 삽입:

```html
<!-- 메이크샵 상품 상세 하단 -->
<div class="related-content">
  <h3>이 상품으로 만들 수 있어요</h3>
  <ul>
    <li>
      <a href="https://content.foreverlove.co.kr/tutorials/basic-pressing">
        기본 압화 만들기 튜토리얼 →
      </a>
    </li>
    <li>
      <a href="https://content.foreverlove.co.kr/tutorials/bookmark-diy">
        압화 책갈피 만들기 →
      </a>
    </li>
  </ul>
</div>
```

**자동화 (향후)**:
- Next.js API Route로 상품 ID → 관련 튜토리얼 매핑
- 메이크샵 HTML에서 JavaScript로 동적 로드

---

## 대안: 현재 상태 유지 + UX 개선

### 권장하지 않지만, 서브도메인 설정이 어려운 경우

#### 개선 1: 메이크샵 헤더에 콘텐츠 허브 링크 추가

**위치**: 메이크샵 관리자 → 디자인 설정 → 상단 HTML

```html
<div class="top-nav">
  <a href="https://pressco21.vercel.app">
    📚 튜토리얼 · FAQ · 견적서 보러가기 →
  </a>
</div>
```

---

#### 개선 2: 상품 포장지/카드에 QR 코드 삽입

**QR 코드 생성**:
- https://www.qr-code-generator.com/
- URL: `https://pressco21.vercel.app`

**인쇄물 문구 예시**:
```
━━━━━━━━━━━━━━━━━━━━
📱 압화 튜토리얼 & FAQ
QR 코드 스캔 또는
pressco21.vercel.app 접속
━━━━━━━━━━━━━━━━━━━━
```

---

#### 개선 3: 메이크샵 상품 설명에 직접 링크 삽입

**상품 상세 페이지 하단**:
```html
<div class="tutorial-link">
  <p>
    💡 이 상품을 활용한 튜토리얼을 확인해보세요!<br>
    <a href="https://pressco21.vercel.app/tutorials/basic-pressing">
      기본 압화 만들기 튜토리얼 →
    </a>
  </p>
</div>
```

---

#### 개선 4: 메이크샵 푸터에 링크 추가

**위치**: 메이크샵 관리자 → 디자인 설정 → 하단 HTML

```html
<div class="footer-links">
  <a href="https://pressco21.vercel.app/about">회사 소개</a>
  <a href="https://pressco21.vercel.app/faq">FAQ</a>
  <a href="https://pressco21.vercel.app/contact">문의하기</a>
</div>
```

---

## 트러블슈팅

### 문제 1: DNS 전파 지연

**증상**: `nslookup content.foreverlove.co.kr` 시 `NXDOMAIN` 에러

**원인**: DNS 레코드가 아직 전파되지 않음

**해결**:
1. DNS 설정 재확인 (오타, CNAME 값 확인)
2. TTL 확인 (3600초 권장)
3. 최대 48시간 대기
4. 도메인 등록업체 고객센터 문의

---

### 문제 2: Vercel 도메인 검증 실패

**증상**: Vercel에서 `Invalid Configuration` 에러

**원인**: DNS 레코드가 Vercel을 가리키지 않음

**해결**:
1. DNS 레코드 확인:
   ```bash
   nslookup content.foreverlove.co.kr
   ```
2. Vercel IP인지 확인 (`76.76.21.21` 등)
3. CNAME 값 확인 (`cname.vercel-dns.com.` 끝에 점 필수)

---

### 문제 3: SSL 인증서 발급 실패

**증상**: Vercel에서 `SSL: Pending` 상태 지속

**원인**: Let's Encrypt가 도메인 소유권 확인 실패

**해결**:
1. DNS 전파 완료 확인 (24시간 이상 대기)
2. Vercel Dashboard → Domains → Refresh 버튼 클릭
3. 실패 시 도메인 삭제 후 재추가

---

### 문제 4: 기존 Vercel 도메인 리다이렉트 안 됨

**증상**: `pressco21.vercel.app` 접속 시 리다이렉트 안 됨

**원인**: `vercel.json` 설정 오류

**해결**:
1. `vercel.json` 파일 확인 (JSON 문법 에러)
2. 재배포 (`git push`)
3. Vercel Dashboard → Deployments → 최신 배포 확인

---

### 문제 5: 메이크샵 HTML 편집 저장 안 됨

**증상**: 메이크샵 관리자에서 HTML 저장 실패

**원인**: 메이크샵 보안 정책 (JavaScript 차단)

**해결**:
1. JavaScript 제거 (인라인 스타일만 사용)
2. 메이크샵 고객센터 문의 (HTML 편집 권한 확인)

---

### 문제 6: Google Search Console 인덱싱 안 됨

**증상**: 서브도메인이 검색 결과에 안 나옴

**원인**: 아직 크롤링 안 됨

**해결**:
1. Google Search Console에 서브도메인 등록
   - https://search.google.com/search-console/
2. `sitemap.xml` 제출
   - `https://content.foreverlove.co.kr/sitemap.xml`
3. Fetch as Google (URL 검사 도구)
4. 1~2주 대기 (자연스러운 인덱싱)

---

## FAQ

### Q1. 서브도메인 이름을 나중에 변경할 수 있나요?

**A**: 네, 가능합니다. 단, SEO에 영향이 있으므로 초기에 신중히 결정하는 것이 좋습니다.

**변경 절차**:
1. 새 CNAME 레코드 추가 (예: `learn.foreverlove.co.kr`)
2. Vercel에 새 도메인 추가
3. 환경 변수 업데이트
4. 기존 서브도메인 → 새 서브도메인 301 리다이렉트 설정
5. 1개월 후 기존 도메인 삭제

---

### Q2. 메이크샵과 Next.js 사이에 로그인 세션을 공유할 수 있나요?

**A**: 어렵습니다. 두 시스템의 인증 방식이 다르고, 서브도메인이 달라 쿠키 공유도 제한적입니다.

**대안**:
- **SSO (Single Sign-On)**: OAuth 2.0으로 통합 로그인 구현 (복잡, 8시간 이상 소요)
- **현재 권장**: 각각 독립 로그인 유지 (일반적인 방식)

---

### Q3. 서브도메인 비용이 추가로 발생하나요?

**A**: 아니요, 무료입니다.

- **DNS 레코드 추가**: 무료 (도메인 등록업체)
- **Vercel 도메인 추가**: 무료 (Hobby 플랜 포함)
- **SSL 인증서**: 무료 (Let's Encrypt)

---

### Q4. 메이크샵 HTML 편집 권한이 없다면?

**A**: 메이크샵 고객센터에 문의하여 HTML 편집 권한을 요청하세요.

**대안**:
- Footer에 링크 추가 (일부 플랜은 허용)
- 상품 설명에 직접 링크 삽입 (항상 가능)
- 배너 이미지에 URL 표시 (클릭 불가, 시각적 안내만 가능)

---

### Q5. 서브도메인 설정 후 SEO 효과는 언제부터 나타나나요?

**A**: 1~3개월 소요됩니다.

**단계별 효과**:
- **즉시**: Google Search Console에 사이트맵 제출
- **1주일**: 크롤링 시작 (URL 검사 도구로 확인 가능)
- **1개월**: 일부 페이지 인덱싱
- **3개월**: 검색 결과 노출 시작 (키워드 경쟁도에 따라 다름)

---

### Q6. 메이크샵 대신 Next.js로 쇼핑몰을 통합할 수 있나요?

**A**: 기술적으로 가능하지만 권장하지 않습니다.

**이유**:
- 메이크샵 결제 모듈 재구현 필요 (PG사 연동, 4주 이상 소요)
- 주문 관리 시스템 구축 (재고, 배송, CS)
- 메이크샵 기존 데이터 마이그레이션
- **총 예상 시간**: 3~6개월

**권장**: 현재처럼 메이크샵 쇼핑몰 + Next.js 콘텐츠 허브 분리 운영

---

### Q7. 서브도메인으로 변경 시 기존 `pressco21.vercel.app` 링크는 깨지나요?

**A**: 아니요, `vercel.json` 리다이렉트로 자동 전환됩니다.

**예시**:
- 사용자가 `pressco21.vercel.app/tutorials` 접속
- 자동으로 `content.foreverlove.co.kr/tutorials`로 301 리다이렉트

---

### Q8. 여러 서브도메인을 추가할 수 있나요?

**A**: 네, 가능합니다.

**예시 구조**:
```
www.foreverlove.co.kr      → 메이크샵 쇼핑몰
content.foreverlove.co.kr  → Vercel 콘텐츠 허브
api.foreverlove.co.kr      → API 서버 (향후)
blog.foreverlove.co.kr     → 블로그 (향후)
```

**주의**: 각 서브도메인마다 DNS CNAME 레코드 추가 필요

---

## 체크리스트

### Phase 1: DNS 설정 ✅

- [ ] 도메인 등록업체 관리 페이지 접속
- [ ] CNAME 레코드 추가 (`content` → `cname.vercel-dns.com.`)
- [ ] DNS 전파 확인 (`nslookup content.foreverlove.co.kr`)

### Phase 2: Vercel 도메인 추가 ✅

- [ ] Vercel Dashboard → Settings → Domains
- [ ] `content.foreverlove.co.kr` 추가
- [ ] 녹색 체크 표시 확인 (SSL 활성화)

### Phase 3: 환경 변수 업데이트 ✅

- [ ] `.env.local` 수정 (`NEXT_PUBLIC_SITE_URL`)
- [ ] Vercel 환경 변수 업데이트
- [ ] 재배포 (`git push`)

### Phase 4: 메타데이터 업데이트 ✅

- [ ] `layout.tsx` — `metadataBase` 수정
- [ ] `sitemap.ts` — `BASE_URL` 수정
- [ ] `robots.ts` — sitemap URL 수정
- [ ] 빌드 및 배포

### Phase 5: 네비게이션 통합 ✅

- [ ] Next.js Header에 쇼핑몰 링크 추가
- [ ] 메이크샵 상단 HTML에 콘텐츠 허브 링크 추가
- [ ] 테스트 (양방향 링크 동작 확인)

### Phase 6: 리다이렉트 설정 ✅

- [ ] `vercel.json` 생성
- [ ] `pressco21.vercel.app` → `content.foreverlove.co.kr` 301 리다이렉트
- [ ] 배포 후 테스트

### Phase 7: SEO 설정 (선택)

- [ ] Google Search Console에 서브도메인 등록
- [ ] `sitemap.xml` 제출
- [ ] Naver Search Advisor 등록 (선택)

---

## 참고 자료

### 공식 문서
- [Vercel 커스텀 도메인 추가](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Vercel CNAME 설정](https://vercel.com/docs/custom-domains#adding-a-domain)
- [Let's Encrypt SSL 인증서](https://letsencrypt.org/)

### 도메인 등록업체 가이드
- [가비아 CNAME 설정](https://customer.gabia.com/manual/dns/2484)
- [후이즈 DNS 설정](https://whois.co.kr/customer/guide.php)

### DNS 전파 확인 도구
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS?](https://www.whatsmydns.net/)

### Google Search Console
- [속성 추가 가이드](https://support.google.com/webmasters/answer/9008080)
- [사이트맵 제출](https://support.google.com/webmasters/answer/183668)

---

## 마무리

### 권장 타임라인

| 일정 | 작업 | 담당자 |
|------|------|--------|
| **Day 1** | DNS CNAME 레코드 추가 | 사용자 (도메인 관리자) |
| **Day 1~2** | DNS 전파 대기 | 자동 |
| **Day 2** | Vercel 도메인 추가 + SSL 발급 | 사용자 |
| **Day 2** | 환경 변수 + 메타데이터 업데이트 | 개발자 |
| **Day 3** | 네비게이션 통합 (메이크샵 HTML 편집) | 사용자 |
| **Day 3** | 리다이렉트 설정 + 배포 | 개발자 |
| **Day 4** | 전체 테스트 + SEO 설정 | 사용자 + 개발자 |

**총 소요 시간**: 4시간 15분 (작업 시간)
**총 소요 기간**: 3~4일 (DNS 전파 포함)

---

### 최종 확인 사항

- ✅ `content.foreverlove.co.kr` 접속 정상
- ✅ SSL 인증서 활성화 (자물쇠 아이콘)
- ✅ `pressco21.vercel.app` → 서브도메인 리다이렉트 정상
- ✅ 메이크샵 ↔ Next.js 양방향 링크 동작
- ✅ Google Search Console 사이트맵 제출 완료

---

**작성일**: 2026-02-11
**버전**: 1.0.0
**작성자**: Claude Sonnet 4.5
**검토자**: (사용자 검토 필요)
