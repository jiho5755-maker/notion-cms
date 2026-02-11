// ============================================================
// 인증 유틸리티
// 간단한 환경 변수 기반 Admin 인증
// ============================================================

/**
 * Admin 비밀번호 검증
 */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;

  // 환경 변수가 설정되지 않은 경우 기본 비밀번호 사용 (개발 환경용)
  const expectedPassword = adminPassword || "pressco21admin";

  return password === expectedPassword;
}

/**
 * 인증 토큰 생성 (간단한 Base64 인코딩)
 * 실제 프로덕션에서는 JWT 사용 권장
 */
export function generateAuthToken(): string {
  const timestamp = Date.now();
  const secret = process.env.ADMIN_SECRET || "pressco21-secret-key";
  const payload = `${timestamp}:${secret}`;

  return Buffer.from(payload).toString("base64");
}

/**
 * 인증 토큰 검증
 */
export function verifyAuthToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [timestamp, secret] = decoded.split(":");

    const expectedSecret = process.env.ADMIN_SECRET || "pressco21-secret-key";

    // 시크릿 검증
    if (secret !== expectedSecret) {
      return false;
    }

    // 토큰 만료 확인 (24시간)
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (now - tokenTime > TWENTY_FOUR_HOURS) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
