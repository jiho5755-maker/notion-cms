# Open Graph 이미지 제작 가이드

## 개요

Instagram, Facebook, Twitter 등 SNS에서 링크를 공유할 때 표시되는 썸네일 이미지를 제작하는 가이드입니다.

---

## 이미지 사양

| 항목 | 값 |
|------|------|
| **파일명** | `og-default.png` |
| **저장 경로** | `public/images/og-default.png` |
| **크기** | 1200 x 630 픽셀 (필수) |
| **포맷** | PNG 또는 JPG |
| **파일 크기** | 8MB 이하 (권장: 300KB 이하) |
| **비율** | 1.91:1 (표준 Open Graph 비율) |

---

## Canva 템플릿 제작 방법

### 1단계: Canva 접속
1. https://www.canva.com/ 접속 (로그인 필요)
2. "디자인 만들기" 클릭
3. "맞춤 크기" 선택 → **1200 x 630** 픽셀 입력

### 2단계: 디자인 구성
```
┌─────────────────────────────────────────────────┐
│                                                 │
│        [로고]     PRESSCO 21                    │
│                                                 │
│        꽃으로 노는 모든 방법                       │
│                                                 │
│        [대표 이미지 또는 압화 작품 사진]            │
│                                                 │
│                                                 │
│        www.foreverlove.co.kr                    │
└─────────────────────────────────────────────────┘
```

**권장 레이아웃**:
- **상단 (150px)**: 로고 + 브랜드명
- **중앙 (330px)**: 대표 이미지 또는 제품 사진
- **하단 (150px)**: 웹사이트 URL + 설명 문구

### 3단계: 텍스트 설정
- **브랜드명**: 72px, 굵게, 검정색
- **설명 문구**: 48px, 보통, 회색
- **URL**: 32px, 가벼움, 회색
- **폰트**: Noto Sans KR 또는 Pretendard (한글)

### 4단계: 색상
- **배경**: 화이트 (#FFFFFF) 또는 밝은 베이지 (#FAF9F6)
- **강조색**: 브랜드 컬러 (핑크 #FFB7C5 또는 그린 #C5E0B4)
- **텍스트**: 다크그레이 (#1A1A1A)

### 5단계: 다운로드
1. "공유" → "다운로드" 클릭
2. 파일 형식: **PNG** 선택
3. 다운로드 후 파일명을 **`og-default.png`**로 변경
4. `public/images/` 폴더에 저장

---

## 이미지 적용 확인

### 1. 로컬 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000
# 개발자 도구 → Elements → <head> → <meta property="og:image">
```

### 2. Open Graph 검증 도구
배포 후 아래 도구로 검증:

#### opengraph.xyz (권장 ⭐⭐⭐⭐⭐)
- URL: https://www.opengraph.xyz/
- 사용법: URL 입력 → Preview 확인
- 장점: 빠르고, 정확, 캐시 없음

#### Facebook Sharing Debugger
- URL: https://developers.facebook.com/tools/debug/
- 사용법: URL 입력 → "Scrape Again" 클릭
- 용도: Facebook, Instagram 공유 테스트

#### Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- 사용법: URL 입력 → "Preview card" 클릭
- 용도: Twitter(X) 공유 테스트

### 3. Instagram 실제 테스트
1. Instagram 스토리 작성
2. 링크 스티커 추가
3. 웹사이트 URL 입력
4. 썸네일이 자동으로 표시되는지 확인

---

## 고급: 페이지별 Open Graph 이미지

### 튜토리얼 상세 페이지
튜토리얼에는 **커버 이미지**가 자동으로 Open Graph 이미지로 사용됩니다.

예시: `/tutorials/pressed-flower-bookmark`
- `tutorial.coverImage`가 있으면 해당 이미지 사용
- 없으면 `og-default.png` 사용 (폴백)

### Canva에서 튜토리얼 전용 OG 이미지 제작
1. Canva에서 **1200 x 630** 디자인 생성
2. 튜토리얼 제목 + 대표 이미지 배치
3. PNG로 다운로드 후 노션에 업로드
4. 노션 Tutorials DB의 "Cover" 필드에 이미지 설정
5. 웹사이트가 자동으로 이미지를 가져옴

---

## 트러블슈팅

### 문제: Instagram에서 썸네일이 안 보여요
**해결**:
1. 이미지 크기 확인: 반드시 1200 x 630px
2. 파일 경로 확인: `public/images/og-default.png`
3. 배포 확인: Vercel에 배포되었는지 확인
4. 캐시 초기화: Facebook Sharing Debugger에서 "Scrape Again"

### 문제: 이미지가 잘려 보여요
**해결**:
- **Safe Zone** 사용: 상하좌우 50px 여백 유지
- 중요 콘텐츠는 중앙 1000 x 530px 영역에 배치

### 문제: 노션 이미지가 깨져요
**해결**:
- 노션 S3 URL은 1시간 후 만료됨
- 웹사이트는 `/api/notion-image` 프록시 사용 (자동 처리)
- 별도 작업 불필요

---

## 체크리스트

배포 전 확인 사항:

- [ ] `public/images/og-default.png` 파일 생성 (1200x630px)
- [ ] 로컬 개발 서버에서 이미지 표시 확인
- [ ] 프로덕션 배포 (Vercel)
- [ ] opengraph.xyz에서 홈페이지 검증
- [ ] opengraph.xyz에서 튜토리얼 상세 페이지 검증
- [ ] Instagram 스토리에서 링크 공유 테스트
- [ ] Facebook Sharing Debugger 캐시 초기화

---

## 참고 자료

- [Open Graph Protocol 공식 문서](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Next.js Metadata 가이드](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Canva 무료 템플릿](https://www.canva.com/templates/)

---

**작성일**: 2026-02-12
**버전**: 1.0
**예상 소요 시간**: 30분 (Canva 디자인) + 5분 (적용)
