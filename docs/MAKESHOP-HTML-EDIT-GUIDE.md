# 메이크샵 HTML 편집 가이드

> 콘텐츠 허브 링크 추가 (hub.foreverlove.co.kr)

---

## 목적

메이크샵 쇼핑몰 상단에 **콘텐츠 허브 링크**를 추가하여 고객이 튜토리얼, FAQ, 견적서 페이지로 쉽게 이동할 수 있도록 합니다.

---

## 메이크샵 관리자 접속

### 1. 관리자 로그인

```
https://www.foreverlove.co.kr/admin
```

- ID/비밀번호 입력 후 로그인

---

### 2. 디자인 설정 메뉴 진입

```
관리자 → 디자인 설정 → HTML/CSS 편집 → 공통 레이아웃 → 상단 HTML
```

**경로 상세:**
1. 좌측 메뉴에서 **"디자인 설정"** 클릭
2. **"HTML/CSS 편집"** 클릭
3. **"공통 레이아웃"** 선택
4. **"상단 HTML"** 탭 클릭

---

## 추가할 HTML 코드

### 옵션 1: 단일 링크 (권장)

```html
<!-- PRESSCO 21 콘텐츠 허브 링크 -->
<div class="pressco-hub-banner">
  <a href="https://hub.foreverlove.co.kr" target="_blank" rel="noopener noreferrer">
    📚 압화 튜토리얼 · FAQ · 견적서 보러가기 →
  </a>
</div>

<style>
.pressco-hub-banner {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 12px 20px;
  text-align: center;
  border-bottom: 1px solid #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.pressco-hub-banner a {
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.pressco-hub-banner a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .pressco-hub-banner {
    padding: 10px 16px;
  }

  .pressco-hub-banner a {
    font-size: 13px;
  }
}
</style>
```

---

### 옵션 2: 다중 링크 (상세)

```html
<!-- PRESSCO 21 콘텐츠 허브 다중 링크 -->
<div class="pressco-hub-nav">
  <span class="pressco-hub-nav__label">📚 콘텐츠 허브:</span>
  <a href="https://hub.foreverlove.co.kr/tutorials" target="_blank" rel="noopener noreferrer">
    튜토리얼
  </a>
  <span class="pressco-hub-nav__divider">|</span>
  <a href="https://hub.foreverlove.co.kr/faq" target="_blank" rel="noopener noreferrer">
    FAQ
  </a>
  <span class="pressco-hub-nav__divider">|</span>
  <a href="https://hub.foreverlove.co.kr/quotation" target="_blank" rel="noopener noreferrer">
    견적서
  </a>
  <span class="pressco-hub-nav__divider">|</span>
  <a href="https://hub.foreverlove.co.kr/contact" target="_blank" rel="noopener noreferrer">
    문의하기
  </a>
</div>

<style>
.pressco-hub-nav {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 12px 20px;
  text-align: center;
  border-bottom: 1px solid #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pressco-hub-nav__label {
  color: #6b7280;
  font-weight: 600;
  font-size: 14px;
}

.pressco-hub-nav a {
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.pressco-hub-nav a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.pressco-hub-nav__divider {
  color: #d1d5db;
  font-weight: 300;
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .pressco-hub-nav {
    padding: 10px 16px;
    gap: 8px;
  }

  .pressco-hub-nav__label {
    font-size: 13px;
    width: 100%;
    margin-bottom: 4px;
  }

  .pressco-hub-nav a {
    font-size: 13px;
  }
}
</style>
```

---

## 삽입 위치

### 권장 위치: 헤더 바로 아래

```html
<header>
  <!-- 기존 헤더 내용 (로고, 검색, 장바구니 등) -->
</header>

<!-- ✅ 여기에 삽입 (헤더와 메인 콘텐츠 사이) -->
<div class="pressco-hub-banner">
  ...
</div>

<main>
  <!-- 메인 콘텐츠 -->
</main>
```

---

## 저장 및 확인

### 1. 저장

- HTML 편집기 하단의 **"저장"** 버튼 클릭
- 메이크샵이 자동으로 검증 후 저장

### 2. 미리보기

- **"미리보기"** 버튼 클릭하여 실제 화면 확인
- 또는 쇼핑몰 메인 페이지 접속 (`https://www.foreverlove.co.kr`)

### 3. 검증 체크리스트

- [ ] 배너가 헤더 바로 아래에 표시되는가?
- [ ] 링크 클릭 시 새 탭에서 `hub.foreverlove.co.kr`이 열리는가?
- [ ] 모바일에서도 정상 표시되는가?
- [ ] 다크 모드에서도 가독성이 좋은가? (옵션)

---

## 트러블슈팅

### 문제 1: 저장 시 "데이터 수정 실패" 에러

**원인**: JavaScript 코드가 포함되었거나 허용되지 않는 태그 사용

**해결**:
- JavaScript 제거 (인라인 스타일만 사용)
- `<script>` 태그 제거
- 메이크샵 고객센터 문의 (1588-5827)

---

### 문제 2: 배너가 표시되지 않음

**원인**: CSS 클래스명 충돌 또는 삽입 위치 오류

**해결**:
- 클래스명을 더 고유하게 변경 (예: `pressco-hub-banner-v2`)
- 삽입 위치 재확인 (헤더 닫는 태그 `</header>` 바로 아래)

---

### 문제 3: 모바일에서 레이아웃 깨짐

**원인**: 반응형 CSS 미적용 또는 기존 테마 스타일과 충돌

**해결**:
- 미디어 쿼리 확인 (`@media (max-width: 768px)`)
- `flex-wrap: wrap` 추가 (다중 링크의 경우)
- 패딩/폰트 크기 조정

---

### 문제 4: HTML 편집 권한 없음

**증상**: "HTML/CSS 편집" 메뉴가 보이지 않음

**원인**: 메이크샵 플랜에 따라 HTML 편집 권한 제한

**해결**:
1. 메이크샵 고객센터 문의하여 권한 요청
2. 대안: **배너 이미지**로 대체
   - 이미지에 URL 텍스트 표시 (`hub.foreverlove.co.kr`)
   - 클릭 불가능하지만 시각적 안내는 가능
3. 대안: **상품 설명**에 직접 링크 삽입 (항상 가능)

---

## 대안: 상품 상세 페이지 링크

HTML 편집이 불가능한 경우, 각 상품 설명에 직접 링크를 삽입할 수 있습니다.

### 상품 상세 페이지 하단에 추가

```html
<div style="margin-top: 40px; padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
  <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #111827;">
    💡 이 상품을 활용한 튜토리얼을 확인해보세요!
  </p>
  <a href="https://hub.foreverlove.co.kr/tutorials" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: background 0.2s;">
    튜토리얼 보러가기 →
  </a>
</div>
```

**삽입 위치**:
```
상품 관리 → 상품 수정 → 상품 상세 설명 하단
```

---

## FAQ

### Q1. 배너를 일시적으로 숨기고 싶어요.

**A**: CSS에서 `display: none;` 추가

```css
.pressco-hub-banner {
  display: none; /* 숨김 */
}
```

---

### Q2. 배너 배경색을 변경하고 싶어요.

**A**: `background` 속성 수정

```css
.pressco-hub-banner {
  background: #fef3c7; /* 노란색 계열 */
}
```

**색상 추천**:
- 파란색: `#dbeafe` (차분함)
- 초록색: `#d1fae5` (자연스러움)
- 보라색: `#e9d5ff` (고급스러움)
- 노란색: `#fef3c7` (활발함)

---

### Q3. 특정 페이지에만 배너를 표시하고 싶어요.

**A**: 메이크샵의 페이지별 HTML 편집 기능 사용

```
디자인 설정 → HTML/CSS 편집 → 메인 페이지 → 상단 HTML
```

- **메인 페이지만**: 메인 페이지 → 상단 HTML
- **상품 상세만**: 상품 상세 → 상단 HTML
- **전체 페이지**: 공통 레이아웃 → 상단 HTML (현재 설정)

---

### Q4. 배너 높이를 조정하고 싶어요.

**A**: `padding` 속성 수정

```css
.pressco-hub-banner {
  padding: 16px 20px; /* 세로 패딩 증가 (12px → 16px) */
}
```

---

### Q5. 링크 색상을 브랜드 컬러로 변경하고 싶어요.

**A**: `color` 속성 수정

```css
.pressco-hub-banner a {
  color: #8b5cf6; /* 보라색 (예시) */
}

.pressco-hub-banner a:hover {
  color: #7c3aed; /* 진한 보라색 (hover) */
}
```

---

## 완성 예시 스크린샷

### 데스크톱 화면

```
┌─────────────────────────────────────────────┐
│ [로고]  [검색]  [장바구니]  [마이페이지]   │ ← 기존 헤더
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ 📚 압화 튜토리얼 · FAQ · 견적서 보러가기 → │ ← 추가된 배너
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│                                              │
│        메인 배너 이미지 (슬라이드)         │
│                                              │
└─────────────────────────────────────────────┘
```

### 모바일 화면

```
┌───────────────────────┐
│ [로고]  [메뉴] [검색] │ ← 기존 헤더
└───────────────────────┘
┌───────────────────────┐
│ 📚 압화 튜토리얼 ·   │
│ FAQ · 견적서 보러가기│ ← 추가된 배너 (줄바꿈)
└───────────────────────┘
```

---

## 참고 자료

- [메이크샵 디자인 설정 가이드](https://www.makeshop.co.kr/manual/)
- [메이크샵 고객센터](tel:1588-5827)
- [메이크샵 FAQ](https://help.makeshop.co.kr/)

---

**작성일**: 2026-02-11
**작성자**: Claude Sonnet 4.5
