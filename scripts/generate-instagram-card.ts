#!/usr/bin/env tsx
// ============================================================
// PRESSCO 21 — Instagram 카드 이미지 생성 CLI
// 튜토리얼 정보를 기반으로 1080x1080px Instagram 카드 이미지 생성
// ============================================================

import { createCanvas, loadImage, registerFont } from "canvas";
import { DIFFICULTY_LABELS } from "../src/types";
import type { Tutorial } from "../src/types";
import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import dotenv from "dotenv";

// 환경 변수 로드
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// ------------------------------------------------------------
// 설정
// ------------------------------------------------------------

const CARD_SIZE = 1080;
const OUTPUT_DIR = path.join(process.cwd(), "public", "instagram-cards");
const PLACEHOLDER_IMAGE = path.join(process.cwd(), "public", "images", "placeholder.svg");

// 브랜드 컬러 (PRESSCO 21)
const COLORS = {
  overlay: "rgba(0, 0, 0, 0.6)", // 배경 어둡게
  text: "#FFFFFF",
  accent: "#F472B6", // pink-400
  badge: {
    beginner: "#10B981", // emerald-500
    intermediate: "#F59E0B", // amber-500
    advanced: "#EF4444", // rose-500
  },
};

// 난이도 한국어 → 영어 매핑
const DIFFICULTY_KR_TO_EN: Record<string, "beginner" | "intermediate" | "advanced"> = {
  "초급": "beginner",
  "중급": "intermediate",
  "고급": "advanced",
};

// ------------------------------------------------------------
// Notion API: 튜토리얼 조회 (CLI용, 캐싱 없음)
// ------------------------------------------------------------

function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[Notion] NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }
  return new Client({ auth: process.env.NOTION_TOKEN });
}

function getTitle(page: PageObjectResponse): string {
  const titleProp = Object.values(page.properties).find(
    (prop) => prop.type === "title",
  );
  if (!titleProp || titleProp.type !== "title") return "";
  return titleProp.title[0]?.plain_text ?? "";
}

function getProp(page: PageObjectResponse, key: string): any {
  const prop = page.properties[key];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return prop.title[0]?.plain_text ?? "";
    case "rich_text":
      return prop.rich_text[0]?.plain_text ?? "";
    case "select":
      return prop.select?.name ?? "";
    case "files":
      if (prop.files.length === 0) return "";
      const file = prop.files[0];
      if (file.type === "external") return file.external.url;
      if (file.type === "file") return file.file.url;
      return "";
    default:
      return "";
  }
}

function getFiles(page: PageObjectResponse, key: string): string[] {
  const prop = page.properties[key];
  if (!prop || prop.type !== "files") return [];

  return prop.files.map((file) => {
    if (file.type === "external") return file.external.url;
    if (file.type === "file") return file.file.url;
    return "";
  });
}

async function getTutorialBySlugDirect(slug: string): Promise<Pick<Tutorial, "title" | "difficulty" | "duration" | "coverImage"> | null> {
  const databaseId = process.env.NOTION_DB_TUTORIALS;
  if (!databaseId) {
    throw new Error("[Notion] NOTION_DB_TUTORIALS 환경 변수가 설정되지 않았습니다.");
  }

  const client = getNotionClient();
  const response = await client.databases.query({
    database_id: databaseId,
    filter: {
      property: "slug",
      rich_text: {
        equals: slug,
      },
    },
  });

  const page = response.results[0];
  if (!page || !("properties" in page)) return null;

  const pageObj = page as PageObjectResponse;

  const difficultyRaw = getProp(pageObj, "difficulty") || "초급";
  const difficulty = DIFFICULTY_KR_TO_EN[difficultyRaw] || "beginner";
  const duration = getProp(pageObj, "duration") || "30분";
  const coverImage = getFiles(pageObj, "coverImage")[0] ?? "";

  return {
    title: getTitle(pageObj),
    difficulty: difficulty,
    duration: duration,
    coverImage: coverImage,
  };
}

// ------------------------------------------------------------
// 유틸리티: 이미지 다운로드
// ------------------------------------------------------------

/**
 * URL에서 이미지를 다운로드하여 Buffer로 반환한다.
 */
async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
  });
}

// ------------------------------------------------------------
// 유틸리티: 텍스트 줄바꿈
// ------------------------------------------------------------

/**
 * 긴 텍스트를 지정된 너비에 맞춰 줄바꿈한다.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = `${currentLine} ${word}`;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

// ------------------------------------------------------------
// 메인: Instagram 카드 생성
// ------------------------------------------------------------

async function generateInstagramCard(slug: string): Promise<void> {
  console.log(`[Instagram Card] 튜토리얼 조회 중: ${slug}`);

  // 1. Notion API로 튜토리얼 조회 (CLI용 직접 조회)
  const tutorial = await getTutorialBySlugDirect(slug);
  if (!tutorial) {
    throw new Error(`튜토리얼을 찾을 수 없습니다: ${slug}`);
  }

  console.log(`[Instagram Card] 튜토리얼 찾음: ${tutorial.title}`);

  // 2. 캔버스 생성
  const canvas = createCanvas(CARD_SIZE, CARD_SIZE);
  const ctx = canvas.getContext("2d");

  // 3. 배경 이미지 로드 (커버 이미지 또는 placeholder)
  let bgImage;
  try {
    if (tutorial.coverImage) {
      console.log(`[Instagram Card] 커버 이미지 다운로드 중...`);
      const imageBuffer = await downloadImage(tutorial.coverImage);
      bgImage = await loadImage(imageBuffer);
    } else {
      throw new Error("커버 이미지가 없습니다.");
    }
  } catch (error) {
    console.warn(`[Instagram Card] 커버 이미지 로드 실패, placeholder 사용:`, error);
    bgImage = await loadImage(PLACEHOLDER_IMAGE);
  }

  // 4. 배경 이미지 그리기 (중앙 정렬, 크롭)
  const scale = Math.max(CARD_SIZE / bgImage.width, CARD_SIZE / bgImage.height);
  const scaledWidth = bgImage.width * scale;
  const scaledHeight = bgImage.height * scale;
  const x = (CARD_SIZE - scaledWidth) / 2;
  const y = (CARD_SIZE - scaledHeight) / 2;

  ctx.drawImage(bgImage, x, y, scaledWidth, scaledHeight);

  // 5. 어두운 오버레이
  ctx.fillStyle = COLORS.overlay;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  // 한글 폰트 설정 (macOS 시스템 폰트 사용)
  const KOREAN_FONT = "AppleGothic, Apple SD Gothic Neo, Arial, sans-serif";

  // 6. 왼쪽 상단: 난이도 배지
  const difficultyLabel = DIFFICULTY_LABELS[tutorial.difficulty];
  const badgeColor = COLORS.badge[tutorial.difficulty];

  ctx.fillStyle = badgeColor;
  ctx.fillRect(40, 40, 160, 60);

  ctx.fillStyle = COLORS.text;
  ctx.font = `bold 32px ${KOREAN_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(difficultyLabel, 120, 70);

  // 7. 오른쪽 상단: 소요 시간
  ctx.fillStyle = COLORS.accent;
  ctx.font = `bold 28px ${KOREAN_FONT}`;
  ctx.textAlign = "right";
  ctx.fillText(tutorial.duration, CARD_SIZE - 40, 70);

  // 8. 중앙: 제목 (줄바꿈 처리)
  ctx.fillStyle = COLORS.text;
  ctx.font = `bold 60px ${KOREAN_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const titleLines = wrapText(ctx, tutorial.title, CARD_SIZE - 120);
  const lineHeight = 80;
  const startY = CARD_SIZE / 2 - ((titleLines.length - 1) * lineHeight) / 2;

  titleLines.forEach((line, index) => {
    ctx.fillText(line, CARD_SIZE / 2, startY + index * lineHeight);
  });

  // 9. 하단: PRESSCO 21 브랜드
  ctx.fillStyle = COLORS.accent;
  ctx.font = `bold 40px ${KOREAN_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("PRESSCO 21", CARD_SIZE / 2, CARD_SIZE - 100);

  ctx.fillStyle = COLORS.text;
  ctx.font = `28px ${KOREAN_FONT}`;
  ctx.fillText("꽃으로 노는 모든 방법", CARD_SIZE / 2, CARD_SIZE - 50);

  // 10. 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 11. PNG 파일 저장
  const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ [Instagram Card] 생성 완료: ${outputPath}`);
  console.log(`   크기: ${CARD_SIZE}x${CARD_SIZE}px`);
  console.log(`   제목: ${tutorial.title}`);
  console.log(`   난이도: ${difficultyLabel}`);
  console.log(`   소요 시간: ${tutorial.duration}`);
}

// ------------------------------------------------------------
// CLI 실행
// ------------------------------------------------------------

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.error("❌ 사용법: npm run instagram:card -- <tutorial-slug>");
    console.error("   예시: npm run instagram:card -- pressed-flower-bookmark");
    process.exit(1);
  }

  try {
    await generateInstagramCard(slug);
  } catch (error) {
    console.error("❌ [Instagram Card] 생성 실패:", error);
    process.exit(1);
  }
}

main();
