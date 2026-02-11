# 서브도메인 전환 빠른 시작 가이드

> 5분 안에 서브도메인 전환 시작하기

---

## 전환 개요

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| **도메인** | `pressco21.vercel.app` | `content.foreverlove.co.kr` |
| **리다이렉트** | 없음 | 기존 → 새 도메인 (301) |

**소요 시간**: 15분 (작업) + 1~2시간 (DNS 전파)

---

## 1단계: 변경 사항 미리보기 (1분)

```bash
cd /Users/jangjiho/workspace/notion-cms
npm run migrate:subdomain -- --preview
```

**예상 출력**:
```
━━━━ 변경 미리보기 ━━━━

📄 .env.local
  - NEXT_PUBLIC_SITE_URL=https://pressco21.vercel.app
  + NEXT_PUBLIC_SITE_URL=https://content.foreverlove.co.kr

📄 src/app/layout.tsx
  - https://pressco21.vercel.app
  + https://content.foreverlove.co.kr

📄 vercel.json (신규 생성)
  301 리다이렉트: pressco21.vercel.app → content.foreverlove.co.kr
```

---

## 2단계: DNS 설정 (5분)

### 도메인 등록업체 관리 페이지 접속

- 가비아: https://domain.gabia.com/
- 후이즈: https://whois.co.kr/
- 카페24: https://www.cafe24.com/

### CNAME 레코드 추가

```
Type:   CNAME
Host:   content
Value:  cname.vercel-dns.com.
TTL:    3600
```

**⚠️ 주의**:
- Host는 `content`만 입력 (전체 도메인 아님)
- Value 끝에 `.` (점) 필수

### DNS 전파 확인 (1~2시간)

```bash
nslookup content.foreverlove.co.kr
```

**성공 시**:
```
Address: 76.76.21.21  # Vercel IP
```

---

## 3단계: 스크립트 실행 (1분)

```bash
npm run migrate:subdomain
```

**실행 화면**:
```
⚠️  위 내용대로 파일을 변경하시겠습니까? (y/N): y

✅ 백업 생성: .env.local.backup
✅ .env.local 업데이트 완료
✅ layout.tsx 업데이트 완료
✅ sitemap.ts 업데이트 완료
✅ robots.ts 업데이트 완료
✅ vercel.json 생성 완료

━━━━ 완료 ━━━━

다음 단계:
  1. Vercel에 도메인 추가
  2. 환경 변수 업데이트
  3. 재배포
```

---

## 4단계: Vercel 설정 (5분)

### 4.1 도메인 추가

1. https://vercel.com/ 로그인
2. PRESSCO 21 프로젝트 선택
3. **Settings** → **Domains** → **Add**
4. `content.foreverlove.co.kr` 입력
5. 검증 대기 (녹색 체크 표시)

### 4.2 환경 변수 업데이트

1. **Settings** → **Environment Variables**
2. `NEXT_PUBLIC_SITE_URL` 편집
3. 값: `https://content.foreverlove.co.kr`
4. Production, Preview, Development 모두 체크
5. **Save**

---

## 5단계: 배포 (2분)

```bash
git add .env.local src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts vercel.json
git commit -m "서브도메인 전환 완료

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

**Vercel 자동 배포 확인** (2~3분 소요)

---

## 6단계: 테스트 (2분)

### 새 도메인 접속

```bash
curl -I https://content.foreverlove.co.kr
# HTTP/2 200 (성공)
```

브라우저: https://content.foreverlove.co.kr

### 리다이렉트 확인

```bash
curl -I https://pressco21.vercel.app
# HTTP/2 301 (리다이렉트)
# location: https://content.foreverlove.co.kr/
```

---

## 롤백 방법 (긴급)

문제 발생 시:

```bash
npm run migrate:rollback
git add .
git commit -m "롤백: 서브도메인 전환 취소"
git push
```

---

## 도움말

### 전체 가이드

- **상세 실행 가이드**: [SUBDOMAIN-MIGRATION-GUIDE.md](./SUBDOMAIN-MIGRATION-GUIDE.md)
- **통합 전략 문서**: [MAKESHOP-INTEGRATION-STRATEGY.md](./MAKESHOP-INTEGRATION-STRATEGY.md)

### 스크립트 옵션

```bash
npm run migrate:subdomain -- --preview   # 미리보기만
npm run migrate:subdomain -- --yes       # 확인 프롬프트 건너뛰기
npm run migrate:subdomain -- --dry-run   # 드라이런 (파일 수정 안 함)
npm run migrate:subdomain -- --help      # 도움말
npm run migrate:rollback                 # 롤백
```

### 트러블슈팅

| 문제 | 해결 |
|------|------|
| DNS 전파 안 됨 | CNAME 값 확인, 48시간 대기 |
| Vercel 검증 실패 | DNS 전파 대기 후 Refresh 버튼 |
| SSL 발급 안 됨 | 24시간 대기 후 도메인 재추가 |
| 리다이렉트 안 됨 | vercel.json 확인 후 재배포 |

---

## 체크리스트

- [ ] DNS CNAME 레코드 추가
- [ ] DNS 전파 확인 (`nslookup`)
- [ ] 스크립트 실행 (`npm run migrate:subdomain`)
- [ ] Vercel 도메인 추가
- [ ] Vercel 환경 변수 업데이트
- [ ] Git 커밋 및 푸시
- [ ] 새 도메인 접속 테스트
- [ ] 리다이렉트 테스트
- [ ] SSL 인증서 확인

---

**작성일**: 2026-02-12
**작성자**: Claude Sonnet 4.5
**버전**: 1.0.0
