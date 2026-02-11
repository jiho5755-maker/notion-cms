#!/usr/bin/env tsx

/**
 * YouTube 설명란 자동 생성 CLI 도구
 *
 * 사용법:
 *   npm run youtube:desc -- pressed-flower-bookmark
 *   npm run youtube:desc -- mini-flower-frame > description.txt
 */

// .env.local 파일 로드
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { formatPrice } from "../src/lib/price";

// Notion 클라이언트 초기화 (캐시 없이 직접 호출)
function getNotionClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }
  return new Client({ auth: token });
}

// 헬퍼 함수: 프로퍼티 값 추출
function getProp(page: any, key: string): any {
  const prop = page.properties[key];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return prop.title.map((t: any) => t.plain_text).join("") || "";
    case "rich_text":
      return prop.rich_text.map((t: any) => t.plain_text).join("") || "";
    case "number":
      return prop.number || 0;
    case "select":
      return prop.select?.name || "";
    case "url":
      return prop.url || "";
    case "checkbox":
      return prop.checkbox || false;
    case "relation":
      return prop.relation.map((r: any) => r.id);
    default:
      return "";
  }
}

// 제목 추출 헬퍼 (title 프로퍼티)
function getTitle(page: any): string {
  const titleProp = Object.values(page.properties).find(
    (prop: any) => prop.type === "title"
  ) as any;

  if (!titleProp) return "";
  return titleProp.title.map((t: any) => t.plain_text).join("") || "";
}

// 헬퍼 함수: Files 프로퍼티 추출
function getFiles(page: any, key: string): string[] {
  const prop = page.properties[key];
  if (!prop || prop.type !== "files") return [];

  return prop.files.map((file: any) => {
    if (file.type === "external") return file.external.url;
    if (file.type === "file") return file.file.url;
    return "";
  }).filter(Boolean);
}

// 튜토리얼 조회 (캐시 없이)
async function getTutorialBySlugDirect(slug: string) {
  const databaseId = process.env.NOTION_DB_TUTORIALS;
  if (!databaseId) {
    throw new Error("NOTION_DB_TUTORIALS 환경 변수가 설정되지 않았습니다.");
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

  // Materials 조회
  const materialIds = getProp(page, "materials") as string[];
  const materials = await Promise.all(
    materialIds.map(async (id) => {
      try {
        const materialPage = await client.pages.retrieve({ page_id: id });
        if (!("properties" in materialPage)) return null;

        return {
          id: materialPage.id,
          title: getTitle(materialPage),
          price: getProp(materialPage, "price"),
          makeshopUrl: getProp(materialPage, "makeshopUrl"),
        };
      } catch {
        return null;
      }
    })
  );

  return {
    id: page.id,
    title: getTitle(page),
    slug: getProp(page, "slug"),
    difficulty: getProp(page, "difficulty") || "beginner",
    duration: getProp(page, "duration"),
    excerpt: getProp(page, "excerpt"),
    materials: materials.filter(Boolean),
  };
}

// ------------------------------------------------------------
// 환경 변수 확인
// ------------------------------------------------------------

if (!process.env.NOTION_TOKEN) {
  console.error("❌ 오류: NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  console.error("   .env.local 파일을 확인하세요.");
  process.exit(1);
}

// ------------------------------------------------------------
// 명령줄 인자 파싱
// ------------------------------------------------------------

const args = process.argv.slice(2);
const slug = args[0];

if (!slug) {
  console.error("❌ 오류: 튜토리얼 slug를 입력하세요.");
  console.error("");
  console.error("사용법:");
  console.error("  npm run youtube:desc -- pressed-flower-bookmark");
  console.error("  npm run youtube:desc -- mini-flower-frame > description.txt");
  process.exit(1);
}

// ------------------------------------------------------------
// UTM 파라미터 생성
// ------------------------------------------------------------

function generateUTMUrl(baseUrl: string, slug: string): string {
  const params = new URLSearchParams({
    utm_source: "youtube",
    utm_medium: "video_description",
    utm_campaign: `tutorial_${slug}`,
  });
  return `${baseUrl}?${params.toString()}`;
}

// ------------------------------------------------------------
// YouTube 설명란 템플릿 생성
// ------------------------------------------------------------

function generateDescription(tutorial: any): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.foreverlove.co.kr";
  const tutorialUrl = `${baseUrl}/tutorials/${tutorial.slug}`;
  const utmUrl = generateUTMUrl(tutorialUrl, tutorial.slug);
  const materialsUrl = `${utmUrl}#materials`;

  // 재료 링크 생성
  const materialLinks = tutorial.materials
    .slice(0, 5) // 최대 5개만 표시
    .map((material: any, index: number) => {
      const productUrl = material.makeshopUrl || `${baseUrl}/product/${material.id}`;
      const utmProductUrl = `${productUrl}?utm_source=youtube`;
      return `• ${material.title} (${formatPrice(material.price)}): ${utmProductUrl}`;
    })
    .join("\n");

  const hasManyMaterials = tutorial.materials.length > 5;
  const remainingCount = tutorial.materials.length - 5;

  // 템플릿 생성
  return `🌸 ${tutorial.title} — 전체 가이드

이 튜토리얼의 상세한 만들기 가이드와 필요한 재료를 확인하세요:
👉 ${utmUrl}

${tutorial.excerpt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 필요한 재료 (한 번에 구매)

재료 세트를 한 번에 장바구니에 담으려면 웹사이트를 방문하세요:
👉 ${materialsUrl}

개별 구매:
${materialLinks}${hasManyMaterials ? `\n... 외 ${remainingCount}개 (웹사이트에서 전체 확인)` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ 타임스탬프

0:00 인트로
0:15 재료 소개
1:30 주요 작업 시작
${tutorial.duration ? `${convertDurationToMinutes(tutorial.duration)}:00 마무리 작업` : "X:XX 마무리 작업"}
${tutorial.duration ? `${convertDurationToMinutes(tutorial.duration) + 2}:00 완성작 소개` : "X:XX 완성작 소개"}

💡 TIP: 위 타임스탬프는 예시입니다. 실제 영상에 맞게 수정하세요!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌸 PRESSCO 21 (프레스코21)

압화(pressed flower) 전문 콘텐츠 허브
"꽃으로 노는 모든 방법"

🛒 쇼핑몰: ${baseUrl}
📚 튜토리얼: ${baseUrl}/tutorials?utm_source=youtube
📦 재료 조합: ${baseUrl}/combos?utm_source=youtube
📷 Instagram: [Instagram 계정 링크를 입력하세요]
📌 네이버 블로그: [블로그 링크를 입력하세요]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#압화 #pressedflower #${tutorial.slug.replace(/-/g, "")} #DIY #handmade #취미 #힐링 #플라워아트 #만들기 #craft
`;
}

// ------------------------------------------------------------
// 소요 시간 변환 (예: "30분" → 28)
// ------------------------------------------------------------

function convertDurationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)/);
  if (!match) return 5;

  const num = parseInt(match[1], 10);

  // "시간" 단위 처리
  if (duration.includes("시간")) {
    return num * 60 - 2; // 마무리 작업 2분 전
  }

  // "분" 단위 처리
  return Math.max(num - 2, 3); // 최소 3분
}

// ------------------------------------------------------------
// 메인 로직
// ------------------------------------------------------------

async function main() {
  console.error(`\n🔍 튜토리얼 조회 중: ${slug}\n`);

  const tutorial = await getTutorialBySlugDirect(slug);

  if (!tutorial) {
    console.error(`❌ 오류: 튜토리얼을 찾을 수 없습니다. (slug: ${slug})`);
    console.error("");
    console.error("사용 가능한 slug 확인:");
    console.error("  1. 노션 Tutorials DB에서 slug 필드 확인");
    console.error("  2. 웹사이트 /tutorials 페이지 URL 확인");
    console.error("");
    console.error("예시:");
    console.error("  - pressed-flower-bookmark");
    console.error("  - mini-flower-frame");
    console.error("  - flower-gift-tag");
    process.exit(1);
  }

  console.error(`✅ 튜토리얼 발견: ${tutorial.title}`);
  console.error(`   재료 개수: ${tutorial.materials.length}개`);
  console.error(`   소요 시간: ${tutorial.duration || "미설정"}`);
  console.error(`   난이도: ${tutorial.difficulty}`);
  console.error("");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("");

  // YouTube 설명란 생성
  const description = generateDescription(tutorial);

  // 표준 출력으로 출력 (리다이렉트 가능)
  console.log(description);

  console.error("");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("");
  console.error("✅ YouTube 설명란이 생성되었습니다!");
  console.error("");
  console.error("📋 다음 단계:");
  console.error("  1. 위 내용을 복사 (Ctrl+A → Ctrl+C)");
  console.error("  2. YouTube Studio 접속 (https://studio.youtube.com)");
  console.error("  3. 영상 선택 → 세부정보 → 설명란에 붙여넣기");
  console.error("  4. 타임스탬프를 실제 영상에 맞게 수정");
  console.error("  5. Instagram/블로그 링크 추가");
  console.error("  6. 저장 클릭");
  console.error("");
  console.error("💾 파일로 저장하려면:");
  console.error(`  npm run youtube:desc -- ${slug} > youtube-description-${slug}.txt`);
  console.error("");
}

main().catch((error) => {
  console.error("\n❌ 오류 발생:");
  console.error(error);
  process.exit(1);
});
