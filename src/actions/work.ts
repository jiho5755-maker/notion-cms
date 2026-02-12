// ============================================================
// 업무 관리 시스템 — Server Actions
// Notion API CRUD 작업을 처리하는 Server Actions
// ============================================================

"use server";

import { revalidatePath } from "next/cache";
import { Client } from "@notionhq/client";
import type {
  QuickTaskInput,
  TaskInput,
  TaskUpdate,
  TaskStatus,
  DailyPlanInput,
  WeekTheme,
} from "@/types/work";

// ------------------------------------------------------------
// Notion 클라이언트 초기화
// ------------------------------------------------------------

function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[Work Actions] NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }

  return new Client({ auth: process.env.NOTION_TOKEN });
}

// ------------------------------------------------------------
// 헬퍼 함수
// ------------------------------------------------------------

/**
 * 날짜 문자열로부터 요일 테마를 계산한다.
 */
function getWeekThemeFromDate(dateStr: string): WeekTheme {
  const date = new Date(dateStr);
  const dayIndex = date.getDay(); // 0=일요일, 1=월요일...
  const themes: WeekTheme[] = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  return themes[dayIndex];
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환한다.
 */
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// ------------------------------------------------------------
// 작업 생성/수정/삭제
// ------------------------------------------------------------

/**
 * 빠른 작업 생성 (모바일용)
 * - 최소 입력: 작업명, 마감일
 * - 나머지는 기본값 자동 설정
 */
export async function createQuickTaskAction(
  input: QuickTaskInput,
): Promise<{ success: boolean; error?: string; taskId?: string }> {
  try {
    const databaseId = process.env.NOTION_DB_TASKS;
    if (!databaseId) {
      return {
        success: false,
        error: "NOTION_DB_TASKS 환경 변수가 설정되지 않았습니다.",
      };
    }

    const client = getNotionClient();
    const weekTheme = getWeekThemeFromDate(input.dueDate);

    // Notion Pages API 호출
    const response = await client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [
            {
              text: {
                content: input.title,
              },
            },
          ],
        },
        status: {
          select: {
            name: "진행 전",
          },
        },
        workArea: {
          select: {
            name: "기타 업무",
          },
        },
        priority: {
          select: {
            name: "보통",
          },
        },
        dueDate: {
          date: {
            start: input.dueDate,
          },
        },
        complexity: {
          number: 3,
        },
        collaboration: {
          number: 2,
        },
        consequence: {
          number: 3,
        },
        weekTheme: {
          select: {
            name: weekTheme,
          },
        },
      },
    });

    // ISR 캐시 무효화
    revalidatePath("/work/tasks");
    revalidatePath("/work/daily");

    return {
      success: true,
      taskId: response.id,
    };
  } catch (error) {
    console.error("[Work Actions] createQuickTaskAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "작업 생성에 실패했습니다.",
    };
  }
}

/**
 * 전체 작업 생성
 * - 모든 필드 지정 가능
 */
export async function createTaskAction(
  input: TaskInput,
): Promise<{ success: boolean; error?: string; taskId?: string }> {
  try {
    const databaseId = process.env.NOTION_DB_TASKS;
    if (!databaseId) {
      return {
        success: false,
        error: "NOTION_DB_TASKS 환경 변수가 설정되지 않았습니다.",
      };
    }

    const client = getNotionClient();
    const weekTheme = input.weekTheme || getWeekThemeFromDate(input.dueDate);

    // properties 객체 구성
    const properties: any = {
      title: {
        title: [
          {
            text: {
              content: input.title,
            },
          },
        ],
      },
      status: {
        select: {
          name: "진행 전",
        },
      },
      workArea: {
        select: {
          name: input.workArea,
        },
      },
      priority: {
        select: {
          name: input.priority || "보통",
        },
      },
      dueDate: {
        date: {
          start: input.dueDate,
        },
      },
      complexity: {
        number: input.complexity ?? 3,
      },
      collaboration: {
        number: input.collaboration ?? 2,
      },
      consequence: {
        number: input.consequence ?? 3,
      },
      weekTheme: {
        select: {
          name: weekTheme,
        },
      },
    };

    // 선택적 필드
    if (input.estimatedTime !== undefined) {
      properties.estimatedTime = {
        number: input.estimatedTime,
      };
    }

    if (input.notes) {
      properties.notes = {
        rich_text: [
          {
            text: {
              content: input.notes,
            },
          },
        ],
      };
    }

    if (input.assignedTo) {
      properties.assignedTo = {
        relation: [
          {
            id: input.assignedTo,
          },
        ],
      };
    }

    if (input.project) {
      properties.project = {
        relation: [
          {
            id: input.project,
          },
        ],
      };
    }

    // Notion Pages API 호출
    const response = await client.pages.create({
      parent: { database_id: databaseId },
      properties,
    });

    // ISR 캐시 무효화
    revalidatePath("/work/tasks");
    revalidatePath("/work/daily");

    return {
      success: true,
      taskId: response.id,
    };
  } catch (error) {
    console.error("[Work Actions] createTaskAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "작업 생성에 실패했습니다.",
    };
  }
}

/**
 * 작업 수정
 */
export async function updateTaskAction(
  update: TaskUpdate,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getNotionClient();

    // properties 객체 구성 (변경된 필드만)
    const properties: any = {};

    if (update.title !== undefined) {
      properties.title = {
        title: [
          {
            text: {
              content: update.title,
            },
          },
        ],
      };
    }

    if (update.status !== undefined) {
      properties.status = {
        select: {
          name: update.status,
        },
      };
    }

    if (update.priority !== undefined) {
      properties.priority = {
        select: {
          name: update.priority,
        },
      };
    }

    if (update.dueDate !== undefined) {
      properties.dueDate = {
        date: {
          start: update.dueDate,
        },
      };
    }

    if (update.estimatedTime !== undefined) {
      properties.estimatedTime = {
        number: update.estimatedTime,
      };
    }

    if (update.actualTime !== undefined) {
      properties.actualTime = {
        number: update.actualTime,
      };
    }

    if (update.complexity !== undefined) {
      properties.complexity = {
        number: update.complexity,
      };
    }

    if (update.collaboration !== undefined) {
      properties.collaboration = {
        number: update.collaboration,
      };
    }

    if (update.consequence !== undefined) {
      properties.consequence = {
        number: update.consequence,
      };
    }

    if (update.notes !== undefined) {
      properties.notes = {
        rich_text: [
          {
            text: {
              content: update.notes,
            },
          },
        ],
      };
    }

    if (update.assignedTo !== undefined) {
      properties.assignedTo = {
        relation: update.assignedTo
          ? [
              {
                id: update.assignedTo,
              },
            ]
          : [],
      };
    }

    // Notion Pages API 호출
    await client.pages.update({
      page_id: update.id,
      properties,
    });

    // ISR 캐시 무효화
    revalidatePath("/work/tasks");
    revalidatePath("/work/daily");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] updateTaskAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "작업 수정에 실패했습니다.",
    };
  }
}

/**
 * 작업 상태 변경 (빠른 업데이트용)
 */
export async function updateTaskStatusAction(
  id: string,
  status: TaskStatus,
): Promise<{ success: boolean; error?: string }> {
  return updateTaskAction({ id, status });
}

/**
 * 작업 삭제 (실제로는 archive)
 */
export async function deleteTaskAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getNotionClient();

    // Notion Pages API - archive
    await client.pages.update({
      page_id: id,
      archived: true,
    });

    // ISR 캐시 무효화
    revalidatePath("/work/tasks");
    revalidatePath("/work/daily");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] deleteTaskAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "작업 삭제에 실패했습니다.",
    };
  }
}

// ------------------------------------------------------------
// 일일 계획 생성
// ------------------------------------------------------------

/**
 * 일일 계획 생성
 * - top3TaskIds를 Relation으로 설정
 */
export async function createDailyPlanAction(
  input: DailyPlanInput,
): Promise<{ success: boolean; error?: string; planId?: string }> {
  try {
    const databaseId = process.env.NOTION_DB_DAILY_PLANS;
    if (!databaseId) {
      return {
        success: false,
        error: "NOTION_DB_DAILY_PLANS 환경 변수가 설정되지 않았습니다.",
      };
    }

    const client = getNotionClient();

    // Notion Pages API 호출
    const response = await client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [
            {
              text: {
                content: `${input.date} 일일 계획`,
              },
            },
          ],
        },
        date: {
          date: {
            start: input.date,
          },
        },
        theme: {
          select: {
            name: input.theme,
          },
        },
        top3Tasks: {
          relation: input.top3TaskIds.map((id) => ({ id })),
        },
        allTasks: {
          relation: input.top3TaskIds.map((id) => ({ id })),
        },
      },
    });

    // ISR 캐시 무효화
    revalidatePath("/work/daily");

    return {
      success: true,
      planId: response.id,
    };
  } catch (error) {
    console.error("[Work Actions] createDailyPlanAction 에러:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "일일 계획 생성에 실패했습니다.",
    };
  }
}
