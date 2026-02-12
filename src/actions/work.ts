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
  TeamMemberInput,
  TeamMemberUpdate,
  WeeklyReviewInput,
  TaskTemplateInput,
  TaskAttachment,
} from "@/types/work";
import { getTaskById } from "@/lib/work";

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
// ------------------------------------------------------------
// 협업자 생성/수정/삭제
// ------------------------------------------------------------

/**
 * 협업자 생성
 */
export async function createTeamMemberAction(
  input: TeamMemberInput,
): Promise<{ success: boolean; error?: string; memberId?: string }> {
  try {
    const databaseId = process.env.NOTION_DB_TEAM;
    if (!databaseId) {
      return {
        success: false,
        error: "NOTION_DB_TEAM 환경 변수가 설정되지 않았습니다.",
      };
    }

    const client = getNotionClient();

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
      role: {
        select: {
          name: input.role,
        },
      },
    };

    // 선택적 필드
    if (input.email) {
      properties.email = {
        email: input.email,
      };
    }

    if (input.phone) {
      properties.phone_number = {
        phone_number: input.phone,
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

    // Notion Pages API 호출
    const response = await client.pages.create({
      parent: { database_id: databaseId },
      properties,
    });

    // ISR 캐시 무효화
    revalidatePath("/work/team");

    return {
      success: true,
      memberId: response.id,
    };
  } catch (error) {
    console.error("[Work Actions] createTeamMemberAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "협업자 생성에 실패했습니다.",
    };
  }
}

/**
 * 협업자 수정
 */
export async function updateTeamMemberAction(
  update: TeamMemberUpdate,
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

    if (update.role !== undefined) {
      properties.role = {
        select: {
          name: update.role,
        },
      };
    }

    if (update.email !== undefined) {
      properties.email = {
        email: update.email || "",
      };
    }

    if (update.phone !== undefined) {
      properties.phone_number = {
        phone_number: update.phone || "",
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

    // Notion Pages API 호출
    await client.pages.update({
      page_id: update.id,
      properties,
    });

    // ISR 캐시 무효화
    revalidatePath("/work/team");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] updateTeamMemberAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "협업자 수정에 실패했습니다.",
    };
  }
}

/**
 * 협업자 삭제 (실제로는 archive)
 */
export async function deleteTeamMemberAction(
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
    revalidatePath("/work/team");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] deleteTeamMemberAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "협업자 삭제에 실패했습니다.",
    };
  }
}

// ------------------------------------------------------------
// 주간 리뷰 생성
// ------------------------------------------------------------

/**
 * 주간 리뷰 생성 (수동 생성용)
 * - 통계는 직접 계산하여 전달받음
 */
export async function createWeeklyReviewAction(input: {
  weekStart: string;
  weekEnd: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalTime: number;
  workAreaBreakdown?: string;
  topAchievements?: string;
  nextWeekGoals?: string;
}): Promise<{ success: boolean; error?: string; reviewId?: string }> {
  try {
    const databaseId = process.env.NOTION_DB_WEEKLY_REVIEWS;
    if (!databaseId) {
      return {
        success: false,
        error: "NOTION_DB_WEEKLY_REVIEWS 환경 변수가 설정되지 않았습니다.",
      };
    }

    const client = getNotionClient();

    // 주 번호 계산
    const weekStart = new Date(input.weekStart);
    const year = weekStart.getFullYear();
    const weekNum = Math.ceil(
      (weekStart.getTime() - new Date(year, 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    );

    // properties 객체 구성
    const properties: any = {
      title: {
        title: [
          {
            text: {
              content: `${year}-W${String(weekNum).padStart(2, "0")} 주간 리뷰`,
            },
          },
        ],
      },
      weekStart: {
        date: {
          start: input.weekStart,
        },
      },
      weekEnd: {
        date: {
          start: input.weekEnd,
        },
      },
      totalTasks: {
        number: input.totalTasks,
      },
      completedTasks: {
        number: input.completedTasks,
      },
      completionRate: {
        number: input.completionRate,
      },
      totalTime: {
        number: input.totalTime,
      },
    };

    // 선택적 필드
    if (input.workAreaBreakdown) {
      properties.workAreaBreakdown = {
        rich_text: [
          {
            text: {
              content: input.workAreaBreakdown,
            },
          },
        ],
      };
    }

    if (input.topAchievements) {
      properties.topAchievements = {
        rich_text: [
          {
            text: {
              content: input.topAchievements,
            },
          },
        ],
      };
    }

    if (input.nextWeekGoals) {
      properties.nextWeekGoals = {
        rich_text: [
          {
            text: {
              content: input.nextWeekGoals,
            },
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
    revalidatePath("/work/weekly");

    return {
      success: true,
      reviewId: response.id,
    };
  } catch (error) {
    console.error("[Work Actions] createWeeklyReviewAction 에러:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "주간 리뷰 생성에 실패했습니다.",
    };
  }
}

// ------------------------------------------------------------
// 작업 템플릿 생성/삭제
// ------------------------------------------------------------

/**
 * 작업 템플릿 생성
 */
export async function createTaskTemplateAction(
  input: TaskTemplateInput,
): Promise<{ success: boolean; error?: string; templateId?: string }> {
  try {
    const databaseId = process.env.NOTION_DB_TASK_TEMPLATES;
    if (!databaseId) {
      return {
        success: false,
        error: "NOTION_DB_TASK_TEMPLATES 환경 변수가 설정되지 않았습니다.",
      };
    }

    const client = getNotionClient();

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
      workArea: {
        select: {
          name: input.workArea,
        },
      },
      estimatedTime: {
        number: input.estimatedTime,
      },
      priority: {
        number: input.priority,
      },
      impact: {
        number: input.impact,
      },
    };

    // 선택적 필드
    if (input.checklist && input.checklist.length > 0) {
      properties.checklist = {
        rich_text: [
          {
            text: {
              content: JSON.stringify(input.checklist),
            },
          },
        ],
      };
    }

    if (input.description) {
      properties.description = {
        rich_text: [
          {
            text: {
              content: input.description,
            },
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
    revalidatePath("/work/templates");

    return {
      success: true,
      templateId: response.id,
    };
  } catch (error) {
    console.error("[Work Actions] createTaskTemplateAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "템플릿 생성에 실패했습니다.",
    };
  }
}

/**
 * 작업 템플릿 삭제 (archive)
 */
export async function deleteTaskTemplateAction(
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
    revalidatePath("/work/templates");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] deleteTaskTemplateAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "템플릿 삭제에 실패했습니다.",
    };
  }
}

/**
 * 템플릿에서 작업 생성
 */
export async function createTaskFromTemplateAction(
  templateId: string,
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

    // 템플릿 조회
    const template = await client.pages.retrieve({ page_id: templateId });
    if (!("properties" in template)) {
      return {
        success: false,
        error: "템플릿을 찾을 수 없습니다.",
      };
    }

    const templatePage = template as any;

    // 템플릿 데이터 추출
    const title = templatePage.properties.title?.title[0]?.plain_text ?? "새 작업";
    const workArea = templatePage.properties.workArea?.select?.name ?? "기타 업무";
    const estimatedTime = templatePage.properties.estimatedTime?.number ?? 0;
    const priority = templatePage.properties.priority?.number ?? 3;
    const impact = templatePage.properties.impact?.number ?? 3;
    const checklistStr = templatePage.properties.checklist?.rich_text[0]?.plain_text;
    const description = templatePage.properties.description?.rich_text[0]?.plain_text;

    // 마감일 계산 (오늘 + 예상시간)
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Math.ceil(estimatedTime / 8)); // 하루 8시간 기준
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const weekTheme = getWeekThemeFromDate(dueDateStr);

    // 새 작업 생성
    const properties: any = {
      title: {
        title: [
          {
            text: {
              content: title,
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
          name: workArea,
        },
      },
      priority: {
        select: {
          name: "보통",
        },
      },
      dueDate: {
        date: {
          start: dueDateStr,
        },
      },
      estimatedTime: {
        number: estimatedTime * 60, // 시간 → 분
      },
      complexity: {
        number: priority,
      },
      collaboration: {
        number: 2,
      },
      consequence: {
        number: impact,
      },
      weekTheme: {
        select: {
          name: weekTheme,
        },
      },
    };

    // 체크리스트 복사 (notes에 저장)
    if (checklistStr || description) {
      let notesContent = "";
      if (description) {
        notesContent += description + "\n\n";
      }
      if (checklistStr) {
        try {
          const checklist = JSON.parse(checklistStr);
          notesContent += "## 체크리스트\n";
          checklist.forEach((item: any) => {
            notesContent += `- [ ] ${item.text}\n`;
          });
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }

      if (notesContent) {
        properties.notes = {
          rich_text: [
            {
              text: {
                content: notesContent.trim(),
              },
            },
          ],
        };
      }
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
    console.error("[Work Actions] createTaskFromTemplateAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "작업 생성에 실패했습니다.",
    };
  }
}

// ------------------------------------------------------------
// 시간 추적
// ------------------------------------------------------------

/**
 * 작업 시간 추적 업데이트
 * @param taskId 작업 ID
 * @param additionalSeconds 추가 소요 시간 (초)
 */
export async function updateTaskTimeTrackingAction(
  taskId: string,
  additionalSeconds: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getNotionClient();

    // 기존 actualTime 조회
    const task = await getTaskById(taskId);
    const currentSeconds = task?.actualTime ?? 0;
    const newSeconds = currentSeconds + additionalSeconds;

    // actualTime 업데이트
    await client.pages.update({
      page_id: taskId,
      properties: {
        actualTime: {
          number: newSeconds,
        },
      },
    });

    // ISR 캐시 무효화
    revalidatePath("/work/tasks");
    revalidatePath("/work/daily");
    revalidatePath("/work/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] updateTaskTimeTrackingAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "시간 추적 업데이트에 실패했습니다.",
    };
  }
}

// ------------------------------------------------------------
// 노트 및 첨부파일
// ------------------------------------------------------------

/**
 * 작업 노트 업데이트
 */
export async function updateTaskNotesAction(
  taskId: string,
  notes: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getNotionClient();

    await client.pages.update({
      page_id: taskId,
      properties: {
        notes: {
          rich_text: [
            {
              text: {
                content: notes.slice(0, 2000), // Notion rich_text 제한
              },
            },
          ],
        },
      },
    });

    // ISR 캐시 무효화
    revalidatePath("/work/tasks");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] updateTaskNotesAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "노트 업데이트에 실패했습니다.",
    };
  }
}

/**
 * 작업 첨부파일 추가
 */
export async function addTaskAttachmentAction(
  taskId: string,
  attachment: TaskAttachment,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getNotionClient();

    // 기존 첨부파일 조회
    const task = await getTaskById(taskId);
    const currentAttachments = task?.attachments ?? [];

    // 새 첨부파일 추가
    const newAttachments = [...currentAttachments, attachment];

    // attachments 업데이트
    await client.pages.update({
      page_id: taskId,
      properties: {
        attachments: {
          rich_text: [
            {
              text: {
                content: JSON.stringify(newAttachments).slice(0, 2000),
              },
            },
          ],
        },
      },
    });

    // ISR 캐시 무효화
    revalidatePath("/work/tasks");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] addTaskAttachmentAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "첨부파일 추가에 실패했습니다.",
    };
  }
}

/**
 * 작업 첨부파일 제거
 */
export async function removeTaskAttachmentAction(
  taskId: string,
  attachmentUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getNotionClient();

    // 기존 첨부파일 조회
    const task = await getTaskById(taskId);
    const currentAttachments = task?.attachments ?? [];

    // 첨부파일 제거
    const newAttachments = currentAttachments.filter((a) => a.url !== attachmentUrl);

    // attachments 업데이트
    await client.pages.update({
      page_id: taskId,
      properties: {
        attachments: {
          rich_text: [
            {
              text: {
                content: JSON.stringify(newAttachments).slice(0, 2000),
              },
            },
          ],
        },
      },
    });

    // ISR 캐시 무효화
    revalidatePath("/work/tasks");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Work Actions] removeTaskAttachmentAction 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "첨부파일 제거에 실패했습니다.",
    };
  }
}
