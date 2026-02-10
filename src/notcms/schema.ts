// ============================================================
// PRESSCO 21 — NotCMS 스키마 정의
// 노션 DB 5개에 대응하는 스키마를 정의하고 클라이언트를 생성한다.
//
// 참고: 실제 DB ID는 NotCMS 대시보드에서 연결 후
//       `npx notcms pull` 명령으로 자동 갱신된다.
//       아래 id 값은 플레이스홀더이므로 pull 후 덮어써진다.
// ============================================================

import { Client } from "notcms";
import type { Schema } from "notcms";

export const schema = {
  // 튜토리얼 — 압화 만들기 가이드 콘텐츠
  tutorials: {
    id: "TUTORIALS_DB_ID",
    properties: {
      title: "title",
      slug: "rich_text",
      category: "select",
      difficulty: "select",
      duration: "rich_text",
      youtubeUrl: "url",
      coverImage: "files",
      excerpt: "rich_text",
      published: "checkbox",
    },
  },

  // 재료 — 메이크샵 상품과 대응
  materials: {
    id: "MATERIALS_DB_ID",
    properties: {
      title: "title",
      category: "select",
      price: "number",
      makeshopUrl: "url",
      thumbnails: "files",
    },
  },

  // 재료 조합 — 여러 재료를 묶어 하나의 작품으로 안내
  combos: {
    id: "COMBOS_DB_ID",
    properties: {
      title: "title",
      difficulty: "select",
      thumbnails: "files",
      excerpt: "rich_text",
      published: "checkbox",
    },
  },

  // 시즌 캠페인 — 기간 한정 프로모션/기획전
  seasons: {
    id: "SEASONS_DB_ID",
    properties: {
      title: "title",
      slug: "rich_text",
      period: "rich_text",
      heroImage: "files",
      excerpt: "rich_text",
      published: "checkbox",
    },
  },

  // 카테고리 — 튜토리얼/재료 분류 체계
  categories: {
    id: "CATEGORIES_DB_ID",
    properties: {
      title: "title",
      slug: "rich_text",
      icon: "rich_text",
      order: "number",
    },
  },
} satisfies Schema;

// NotCMS 클라이언트 인스턴스 (지연 초기화)
// 환경변수 NOTCMS_SECRET_KEY 필요
// 빌드 시 환경 변수가 없으면 null을 반환하여 에러 방지
let _nc: Client<typeof schema> | null = null;

/**
 * NotCMS 클라이언트를 반환한다.
 * 환경 변수가 없으면 null을 반환 — 호출부에서 null 체크 필요.
 */
export function getNotCmsClient(): Client<typeof schema> | null {
  if (!process.env.NOTCMS_SECRET_KEY) {
    return null;
  }
  if (!_nc) {
    _nc = new Client({ schema });
  }
  return _nc;
}
