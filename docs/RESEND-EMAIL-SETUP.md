# Resend 이메일 발송 설정 가이드

**현재 상황**: 견적서 이메일이 발송되지 않는 문제
**원인**: Resend Sandbox 모드 제한 (테스트 이메일만 발송 가능)
**해결**: 도메인 인증 후 실제 이메일 주소 사용

---

## 문제 상황

현재 코드에서 `from: "PRESSCO 21 <onboarding@resend.dev>"`를 사용하고 있습니다.
이것은 Resend의 **Sandbox 모드** 테스트 주소로, 다음과 같은 제한이 있습니다:

- ✅ API 호출은 성공 (200 OK)
- ❌ 실제 이메일 전달은 **API Key 소유자 이메일로만** 가능
- ❌ 고객 이메일 (`pressco5755@naver.com` 등)로는 전달 안 됨

---

## 해결 방법 2가지

### 방법 1: 도메인 인증 (권장) ⭐⭐⭐⭐⭐

Resend에서 실제 도메인을 인증하여 자유롭게 이메일을 발송할 수 있습니다.

#### 1-1. Resend 대시보드 접속

1. https://resend.com/login 로그인
2. 좌측 메뉴 **"Domains"** 클릭
3. **"Add Domain"** 버튼 클릭

#### 1-2. 도메인 추가

**옵션 A: 메인 도메인 사용 (권장)**
- 입력: `foreverlove.co.kr`
- From 주소 예시: `contact@foreverlove.co.kr`, `no-reply@foreverlove.co.kr`

**옵션 B: 서브도메인 사용**
- 입력: `hub.foreverlove.co.kr`
- From 주소 예시: `contact@hub.foreverlove.co.kr`

#### 1-3. DNS 레코드 추가

Resend가 제공하는 DNS 레코드를 도메인 관리 페이지에 추가해야 합니다.

**메이크샵에 요청해야 할 DNS 레코드 (예시):**

```
# SPF 레코드 (TXT)
Type: TXT
Name: foreverlove.co.kr (또는 @)
Value: v=spf1 include:spf.resend.com ~all

# DKIM 레코드 (CNAME)
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.u.resend.com

# DMARC 레코드 (TXT, 선택사항)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@foreverlove.co.kr
```

**메이크샵에 1:1 문의 템플릿:**

```
제목: Resend 이메일 발송을 위한 DNS 레코드 추가 요청

안녕하세요.

견적서 자동 발송 기능을 위해 Resend 이메일 서비스를 사용하려고 합니다.
다음 DNS 레코드를 foreverlove.co.kr 도메인에 추가해주실 수 있을까요?

[Resend 대시보드에서 복사한 DNS 레코드 붙여넣기]

1. TXT 레코드: (SPF)
   - Name: @
   - Value: v=spf1 include:spf.resend.com ~all

2. CNAME 레코드: (DKIM)
   - Name: resend._domainkey
   - Value: resend._domainkey.u.resend.com

3. TXT 레코드: (DMARC, 선택)
   - Name: _dmarc
   - Value: v=DMARC1; p=none; rua=mailto:dmarc@foreverlove.co.kr

작업 완료 후 알려주시면 확인하겠습니다.
감사합니다.
```

#### 1-4. 인증 확인

1. Resend 대시보드에서 **"Verify"** 버튼 클릭
2. 상태가 **"Verified"**로 변경되면 완료 ✅
3. DNS 전파는 보통 10분~1시간 소요

#### 1-5. 코드 수정

`src/lib/email.ts` 파일에서 `from` 주소 변경:

```typescript
// 변경 전
from: "PRESSCO 21 <onboarding@resend.dev>",

// 변경 후
from: "PRESSCO 21 <no-reply@foreverlove.co.kr>",
```

또는 환경 변수로 관리:

```bash
# .env.local
COMPANY_EMAIL_SENDER=no-reply@foreverlove.co.kr
```

```typescript
// src/lib/email.ts
from: `PRESSCO 21 <${process.env.COMPANY_EMAIL_SENDER || "no-reply@foreverlove.co.kr"}>`,
```

---

### 방법 2: Sandbox 모드 테스트 (임시) ⭐⭐

도메인 인증 전에 테스트하려면, **API Key 소유자 이메일**을 입력하여 테스트할 수 있습니다.

#### 2-1. Resend API Key 소유자 이메일 확인

1. https://resend.com/settings 접속
2. "Account" 탭에서 로그인한 이메일 주소 확인 (예: `your-email@example.com`)

#### 2-2. 견적서 페이지에서 해당 이메일로 테스트

- 견적서 생성 시 **이메일 입력란**에 API Key 소유자 이메일 입력
- 예: API Key 소유자가 `test@gmail.com`이면, 해당 이메일로 견적서 생성
- ✅ 이메일 수신 확인

---

## 구현 체크리스트

### 방법 1 (도메인 인증) - 권장

- [ ] Resend 대시보드에서 도메인 추가
- [ ] DNS 레코드 복사
- [ ] 메이크샵에 1:1 문의 (DNS 레코드 추가 요청)
- [ ] DNS 전파 대기 (10분~1시간)
- [ ] Resend에서 "Verify" 클릭 → "Verified" 상태 확인
- [ ] `src/lib/email.ts`에서 `from` 주소 변경
- [ ] `.env.local`에 `COMPANY_EMAIL_SENDER` 추가
- [ ] 빌드 및 테스트

### 방법 2 (Sandbox 테스트)

- [ ] Resend 계정 이메일 확인
- [ ] 견적서 페이지에서 해당 이메일로 테스트
- [ ] 이메일 수신 확인

---

## FAQ

### Q1. 도메인 인증 없이 발송할 수 있나요?

A. 아니요. Resend Sandbox 모드는 API Key 소유자 이메일로만 발송 가능하며, 고객 이메일로는 전달되지 않습니다. 실제 서비스하려면 반드시 도메인 인증이 필요합니다.

### Q2. 메이크샵에서 DNS 레코드 추가를 거부하면?

A. 메이크샵이 DNS 레코드 추가를 지원하지 않는 경우:
1. **대안 A**: 가비아로 네임서버 변경 후 직접 DNS 관리
2. **대안 B**: 서브도메인만 가비아에서 관리 (`hub.foreverlove.co.kr`)

### Q3. Gmail/Naver로 발송하면 스팸으로 분류되나요?

A. 도메인 인증(SPF, DKIM, DMARC)을 완료하면 대부분 정상 수신됩니다. 스팸 분류율은 약 5% 미만입니다.

### Q4. 발송 제한이 있나요?

A. Resend 무료 tier:
- 월 3,000 이메일
- 일 100 이메일
- 초과 시 유료 플랜 필요 ($20/월, 50,000 이메일)

### Q5. 도메인 인증까지 얼마나 걸리나요?

A. 전체 프로세스:
1. Resend 도메인 추가: 5분
2. 메이크샵 1:1 문의 제출: 5분
3. 메이크샵 DNS 레코드 추가: 1-2 영업일
4. DNS 전파: 10분~1시간
5. 코드 수정: 5분

**총 소요 시간**: 1-2 영업일

---

## 참고 자료

- Resend 공식 문서: https://resend.com/docs/send-with-nextjs
- Resend 도메인 인증 가이드: https://resend.com/docs/dashboard/domains/introduction
- Resend API Reference: https://resend.com/docs/api-reference/emails/send-email

---

**작성일**: 2026-02-12
**작성자**: Claude Sonnet 4.5
**문서 버전**: 1.0
