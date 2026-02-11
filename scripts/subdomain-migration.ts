#!/usr/bin/env tsx

/**
 * 서브도메인 전환 자동화 스크립트
 *
 * 이 스크립트는 PRESSCO 21 프로젝트의 도메인을 pressco21.vercel.app에서
 * content.foreverlove.co.kr 서브도메인으로 자동 전환한다.
 *
 * 실행 방법:
 *   npm run migrate:subdomain                   # 전환 실행
 *   npm run migrate:subdomain -- --rollback     # 롤백 (원복)
 *   npm run migrate:subdomain -- --preview      # 미리보기 (변경 사항만 표시)
 *   npm run migrate:subdomain -- --dry-run      # 드라이런 (변경 안 함)
 *
 * 안전장치:
 *   - 자동 백업 생성 (.env.local.backup, *.tsx.backup)
 *   - 변경 사항 미리보기
 *   - 확인 프롬프트 (--yes 옵션으로 스킵 가능)
 *   - 롤백 기능
 */

import fs from "fs";
import path from "path";
import readline from "readline";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 설정 상수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const OLD_DOMAIN = "https://pressco21.vercel.app";
const NEW_DOMAIN = "https://content.foreverlove.co.kr";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_FILE = path.join(PROJECT_ROOT, ".env.local");
const LAYOUT_FILE = path.join(PROJECT_ROOT, "src/app/layout.tsx");
const SITEMAP_FILE = path.join(PROJECT_ROOT, "src/app/sitemap.ts");
const ROBOTS_FILE = path.join(PROJECT_ROOT, "src/app/robots.ts");
const VERCEL_CONFIG_FILE = path.join(PROJECT_ROOT, "vercel.json");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 유틸리티 함수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 색상 코드 (ANSI) */
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

/** 로그 헬퍼 */
function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/** 에러 로그 */
function logError(message: string) {
  log(`❌ ${message}`, "red");
}

/** 성공 로그 */
function logSuccess(message: string) {
  log(`✅ ${message}`, "green");
}

/** 경고 로그 */
function logWarning(message: string) {
  log(`⚠️  ${message}`, "yellow");
}

/** 정보 로그 */
function logInfo(message: string) {
  log(`ℹ️  ${message}`, "cyan");
}

/** 섹션 헤더 */
function logSection(title: string) {
  console.log();
  log(`━━━━ ${title} ━━━━`, "bold");
  console.log();
}

/** 사용자 확인 프롬프트 */
async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${message} (y/N): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

/** 파일 존재 확인 */
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/** 백업 파일 경로 */
function getBackupPath(filePath: string): string {
  return `${filePath}.backup`;
}

/** 파일 백업 */
function backupFile(filePath: string): void {
  if (!fileExists(filePath)) {
    logWarning(`파일이 없어서 백업하지 않음: ${path.basename(filePath)}`);
    return;
  }

  const backupPath = getBackupPath(filePath);
  fs.copyFileSync(filePath, backupPath);
  logSuccess(`백업 생성: ${path.basename(backupPath)}`);
}

/** 파일 복원 */
function restoreFile(filePath: string): void {
  const backupPath = getBackupPath(filePath);

  if (!fileExists(backupPath)) {
    logWarning(`백업 파일이 없어서 복원하지 않음: ${path.basename(filePath)}`);
    return;
  }

  fs.copyFileSync(backupPath, filePath);
  logSuccess(`복원 완료: ${path.basename(filePath)}`);
}

/** 백업 파일 삭제 */
function removeBackup(filePath: string): void {
  const backupPath = getBackupPath(filePath);

  if (fileExists(backupPath)) {
    fs.unlinkSync(backupPath);
    logInfo(`백업 파일 삭제: ${path.basename(backupPath)}`);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 도메인 변경 로직
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** .env.local 업데이트 */
function updateEnvFile(dryRun: boolean): { changed: boolean; preview: string } {
  if (!fileExists(ENV_FILE)) {
    logWarning(".env.local 파일이 없습니다. 건너뜀.");
    return { changed: false, preview: "" };
  }

  let content = fs.readFileSync(ENV_FILE, "utf-8");
  const oldContent = content;

  // NEXT_PUBLIC_SITE_URL 업데이트
  content = content.replace(
    /NEXT_PUBLIC_SITE_URL=https:\/\/pressco21\.vercel\.app/g,
    `NEXT_PUBLIC_SITE_URL=${NEW_DOMAIN}`
  );

  // 변경 사항 확인
  const changed = content !== oldContent;

  if (!changed) {
    logInfo(".env.local: 변경 사항 없음");
    return { changed: false, preview: "" };
  }

  // 미리보기 생성
  const preview = `
📄 .env.local
  - NEXT_PUBLIC_SITE_URL=${OLD_DOMAIN}
  + NEXT_PUBLIC_SITE_URL=${NEW_DOMAIN}
`;

  // 파일 쓰기 (dry-run이 아닐 때)
  if (!dryRun) {
    backupFile(ENV_FILE);
    fs.writeFileSync(ENV_FILE, content, "utf-8");
    logSuccess(".env.local 업데이트 완료");
  }

  return { changed, preview };
}

/** layout.tsx 업데이트 */
function updateLayoutFile(dryRun: boolean): { changed: boolean; preview: string } {
  if (!fileExists(LAYOUT_FILE)) {
    logWarning("layout.tsx 파일이 없습니다. 건너뜀.");
    return { changed: false, preview: "" };
  }

  let content = fs.readFileSync(LAYOUT_FILE, "utf-8");
  const oldContent = content;

  // metadataBase URL 업데이트
  content = content.replace(
    /https:\/\/pressco21\.vercel\.app/g,
    NEW_DOMAIN
  );

  const changed = content !== oldContent;

  if (!changed) {
    logInfo("layout.tsx: 변경 사항 없음");
    return { changed: false, preview: "" };
  }

  const preview = `
📄 src/app/layout.tsx
  - process.env.NEXT_PUBLIC_SITE_URL ?? "${OLD_DOMAIN}"
  + process.env.NEXT_PUBLIC_SITE_URL ?? "${NEW_DOMAIN}"

  - url: "${OLD_DOMAIN}"
  + url: "${NEW_DOMAIN}"
`;

  if (!dryRun) {
    backupFile(LAYOUT_FILE);
    fs.writeFileSync(LAYOUT_FILE, content, "utf-8");
    logSuccess("layout.tsx 업데이트 완료");
  }

  return { changed, preview };
}

/** sitemap.ts 업데이트 */
function updateSitemapFile(dryRun: boolean): { changed: boolean; preview: string } {
  if (!fileExists(SITEMAP_FILE)) {
    logWarning("sitemap.ts 파일이 없습니다. 건너뜀.");
    return { changed: false, preview: "" };
  }

  let content = fs.readFileSync(SITEMAP_FILE, "utf-8");
  const oldContent = content;

  content = content.replace(
    /https:\/\/pressco21\.vercel\.app/g,
    NEW_DOMAIN
  );

  const changed = content !== oldContent;

  if (!changed) {
    logInfo("sitemap.ts: 변경 사항 없음");
    return { changed: false, preview: "" };
  }

  const preview = `
📄 src/app/sitemap.ts
  - process.env.NEXT_PUBLIC_SITE_URL || "${OLD_DOMAIN}"
  + process.env.NEXT_PUBLIC_SITE_URL || "${NEW_DOMAIN}"
`;

  if (!dryRun) {
    backupFile(SITEMAP_FILE);
    fs.writeFileSync(SITEMAP_FILE, content, "utf-8");
    logSuccess("sitemap.ts 업데이트 완료");
  }

  return { changed, preview };
}

/** robots.ts 업데이트 */
function updateRobotsFile(dryRun: boolean): { changed: boolean; preview: string } {
  if (!fileExists(ROBOTS_FILE)) {
    logWarning("robots.ts 파일이 없습니다. 건너뜀.");
    return { changed: false, preview: "" };
  }

  let content = fs.readFileSync(ROBOTS_FILE, "utf-8");
  const oldContent = content;

  content = content.replace(
    /https:\/\/pressco21\.vercel\.app/g,
    NEW_DOMAIN
  );

  const changed = content !== oldContent;

  if (!changed) {
    logInfo("robots.ts: 변경 사항 없음");
    return { changed: false, preview: "" };
  }

  const preview = `
📄 src/app/robots.ts
  - process.env.NEXT_PUBLIC_SITE_URL || "${OLD_DOMAIN}"
  + process.env.NEXT_PUBLIC_SITE_URL || "${NEW_DOMAIN}"
`;

  if (!dryRun) {
    backupFile(ROBOTS_FILE);
    fs.writeFileSync(ROBOTS_FILE, content, "utf-8");
    logSuccess("robots.ts 업데이트 완료");
  }

  return { changed, preview };
}

/** vercel.json 생성 */
function createVercelConfig(dryRun: boolean): { changed: boolean; preview: string } {
  const vercelConfig = {
    redirects: [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "pressco21.vercel.app",
          },
        ],
        destination: `${NEW_DOMAIN}/:path*`,
        permanent: true,
      },
    ],
  };

  const content = JSON.stringify(vercelConfig, null, 2) + "\n";

  // 기존 파일이 있으면 백업
  let changed = true;
  if (fileExists(VERCEL_CONFIG_FILE)) {
    const existingContent = fs.readFileSync(VERCEL_CONFIG_FILE, "utf-8");
    if (existingContent === content) {
      logInfo("vercel.json: 변경 사항 없음");
      return { changed: false, preview: "" };
    }
  }

  const preview = `
📄 vercel.json (신규 생성)
  {
    "redirects": [
      {
        "source": "/:path*",
        "has": [{ "type": "host", "value": "pressco21.vercel.app" }],
        "destination": "${NEW_DOMAIN}/:path*",
        "permanent": true
      }
    ]
  }
`;

  if (!dryRun) {
    if (fileExists(VERCEL_CONFIG_FILE)) {
      backupFile(VERCEL_CONFIG_FILE);
    }
    fs.writeFileSync(VERCEL_CONFIG_FILE, content, "utf-8");
    logSuccess("vercel.json 생성 완료");
  }

  return { changed, preview };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메인 로직
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 서브도메인 전환 실행 */
async function migrate(options: {
  dryRun?: boolean;
  preview?: boolean;
  skipConfirm?: boolean;
}) {
  const { dryRun = false, preview = false, skipConfirm = false } = options;

  logSection("서브도메인 전환 자동화 스크립트");

  log(`기존 도메인: ${colors.red}${OLD_DOMAIN}${colors.reset}`, "gray");
  log(`새 도메인: ${colors.green}${NEW_DOMAIN}${colors.reset}`, "gray");
  console.log();

  if (dryRun) {
    logInfo("🔍 드라이런 모드: 파일을 변경하지 않습니다.");
  }

  if (preview) {
    logInfo("👀 미리보기 모드: 변경 사항만 표시합니다.");
  }

  // ── 변경 사항 수집 ──
  logSection("변경 사항 확인");

  const results = {
    env: updateEnvFile(true),
    layout: updateLayoutFile(true),
    sitemap: updateSitemapFile(true),
    robots: updateRobotsFile(true),
    vercel: createVercelConfig(true),
  };

  const hasChanges = Object.values(results).some((r) => r.changed);

  if (!hasChanges) {
    logWarning("변경할 사항이 없습니다. 이미 서브도메인으로 설정되어 있을 수 있습니다.");
    process.exit(0);
  }

  // ── 미리보기 출력 ──
  logSection("변경 미리보기");

  Object.values(results).forEach((result) => {
    if (result.changed && result.preview) {
      log(result.preview, "gray");
    }
  });

  // 미리보기 모드면 여기서 종료
  if (preview) {
    logInfo("미리보기 완료. 실제 변경을 원하면 --preview 옵션 없이 실행하세요.");
    process.exit(0);
  }

  // ── 확인 프롬프트 ──
  if (!skipConfirm && !dryRun) {
    console.log();
    const confirmed = await confirm("위 내용대로 파일을 변경하시겠습니까?");

    if (!confirmed) {
      logWarning("취소되었습니다.");
      process.exit(0);
    }
  }

  // ── 실제 변경 실행 ──
  if (!dryRun) {
    logSection("파일 변경 중...");

    updateEnvFile(false);
    updateLayoutFile(false);
    updateSitemapFile(false);
    updateRobotsFile(false);
    createVercelConfig(false);

    logSection("완료");
    logSuccess("서브도메인 전환이 완료되었습니다!");
    console.log();
    logInfo("다음 단계:");
    log("  1. Vercel에 도메인 추가: https://vercel.com/", "gray");
    log("     - Settings → Domains → Add Domain", "gray");
    log(`     - 입력: ${NEW_DOMAIN.replace("https://", "")}`, "gray");
    console.log();
    log("  2. 환경 변수 업데이트:", "gray");
    log("     - Vercel Dashboard → Settings → Environment Variables", "gray");
    log(`     - NEXT_PUBLIC_SITE_URL = ${NEW_DOMAIN}`, "gray");
    console.log();
    log("  3. 재배포:", "gray");
    log("     - git add .", "gray");
    log('     - git commit -m "서브도메인 전환 완료"', "gray");
    log("     - git push", "gray");
    console.log();
    log("  4. DNS 확인:", "gray");
    log(`     - nslookup ${NEW_DOMAIN.replace("https://", "")}`, "gray");
    console.log();
    logInfo(`상세 가이드: ${PROJECT_ROOT}/docs/SUBDOMAIN-MIGRATION-GUIDE.md`);
  } else {
    logSection("드라이런 완료");
    logInfo("실제 변경을 원하면 --dry-run 옵션 없이 실행하세요.");
  }
}

/** 롤백 실행 */
async function rollback(options: { skipConfirm?: boolean }) {
  const { skipConfirm = false } = options;

  logSection("서브도메인 전환 롤백");

  const backupFiles = [ENV_FILE, LAYOUT_FILE, SITEMAP_FILE, ROBOTS_FILE, VERCEL_CONFIG_FILE]
    .map(getBackupPath)
    .filter(fileExists);

  if (backupFiles.length === 0) {
    logWarning("백업 파일이 없습니다. 롤백할 내용이 없습니다.");
    process.exit(0);
  }

  log("다음 백업 파일이 발견되었습니다:", "gray");
  backupFiles.forEach((file) => {
    log(`  - ${path.basename(file)}`, "gray");
  });
  console.log();

  if (!skipConfirm) {
    const confirmed = await confirm("백업 파일로 복원하시겠습니까?");

    if (!confirmed) {
      logWarning("취소되었습니다.");
      process.exit(0);
    }
  }

  logSection("복원 중...");

  [ENV_FILE, LAYOUT_FILE, SITEMAP_FILE, ROBOTS_FILE, VERCEL_CONFIG_FILE].forEach(restoreFile);

  // vercel.json 백업이 없었으면 삭제
  if (
    !fileExists(getBackupPath(VERCEL_CONFIG_FILE)) &&
    fileExists(VERCEL_CONFIG_FILE)
  ) {
    fs.unlinkSync(VERCEL_CONFIG_FILE);
    logSuccess("vercel.json 삭제 (신규 생성 파일)");
  }

  logSection("완료");
  logSuccess("롤백이 완료되었습니다!");
  console.log();
  logInfo("백업 파일은 수동으로 삭제해주세요:");
  backupFiles.forEach((file) => {
    log(`  - ${file}`, "gray");
  });
}

/** 백업 정리 */
function cleanBackups() {
  logSection("백업 파일 정리");

  const backupFiles = [ENV_FILE, LAYOUT_FILE, SITEMAP_FILE, ROBOTS_FILE, VERCEL_CONFIG_FILE]
    .map(getBackupPath)
    .filter(fileExists);

  if (backupFiles.length === 0) {
    logInfo("백업 파일이 없습니다.");
    process.exit(0);
  }

  backupFiles.forEach((file) => {
    fs.unlinkSync(file);
    logSuccess(`삭제: ${path.basename(file)}`);
  });

  logSection("완료");
  logSuccess("백업 파일이 모두 삭제되었습니다.");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLI 진입점
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  const args = process.argv.slice(2);

  const options = {
    rollback: args.includes("--rollback"),
    dryRun: args.includes("--dry-run"),
    preview: args.includes("--preview"),
    skipConfirm: args.includes("--yes") || args.includes("-y"),
    clean: args.includes("--clean"),
    help: args.includes("--help") || args.includes("-h"),
  };

  // 도움말 출력
  if (options.help) {
    console.log(`
서브도메인 전환 자동화 스크립트

사용법:
  npm run migrate:subdomain [options]

옵션:
  --rollback       백업 파일로 복원 (원복)
  --preview        변경 사항만 미리보기 (파일 수정 안 함)
  --dry-run        드라이런 모드 (백업 생성 안 함, 파일 수정 안 함)
  --yes, -y        확인 프롬프트 건너뛰기
  --clean          백업 파일 모두 삭제
  --help, -h       도움말 출력

예시:
  npm run migrate:subdomain                # 일반 실행 (확인 프롬프트 있음)
  npm run migrate:subdomain -- --preview   # 미리보기만
  npm run migrate:subdomain -- --yes       # 확인 프롬프트 건너뛰기
  npm run migrate:subdomain -- --rollback  # 롤백
  npm run migrate:subdomain -- --clean     # 백업 파일 정리
`);
    process.exit(0);
  }

  // 백업 정리
  if (options.clean) {
    cleanBackups();
    return;
  }

  // 롤백
  if (options.rollback) {
    await rollback({ skipConfirm: options.skipConfirm });
    return;
  }

  // 일반 마이그레이션
  await migrate({
    dryRun: options.dryRun,
    preview: options.preview,
    skipConfirm: options.skipConfirm,
  });
}

// 에러 핸들링
main().catch((error) => {
  logError(`스크립트 실행 중 에러 발생: ${error.message}`);
  process.exit(1);
});
