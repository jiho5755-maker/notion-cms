// ============================================================
// 업무 일정 관리 — Notion API 데이터 페칭
// ISR 캐싱을 통해 Notion API 호출을 최소화한다
// ============================================================

import { unstable_cache } from "next/cache";
import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type {
  Task,
  DailyPlan,
  DailyPlanWithTasks,
  WeeklyReview,
  TeamMember,
  TeamMemberWithTasks,
  Project,
  ProjectWithTasks,
  WorkArea,
  TaskTemplate,
  ChecklistItem,
  TaskAttachment,
} from "@/types/work";

// ------------------------------------------------------------
// Notion 클라이언트 초기화
// ------------------------------------------------------------

function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[Notion Work] NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }

  return new Client({ auth: process.env.NOTION_TOKEN });
}

// ------------------------------------------------------------
// 내부 헬퍼: Notion 속성 추출
// ------------------------------------------------------------

/**
 * Notion 페이지 속성에서 타입별로 값을 안전하게 추출한다.
 */
function getProp(
  page: PageObjectResponse,
  key: string,
): string | number | boolean | string[] {
  const prop = page.properties[key];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return prop.title[0]?.plain_text ?? "";
    case "rich_text":
      return prop.rich_text[0]?.plain_text ?? "";
    case "select":
      return prop.select?.name ?? "";
    case "multi_select":
      return prop.multi_select.map((s) => s.name);
    case "number":
      return prop.number ?? 0;
    case "checkbox":
      return prop.checkbox;
    case "date":
      return prop.date?.start ?? "";
    case "relation":
      return prop.relation.map((r) => r.id);
    case "formula":
      // Formula 타입 처리 (priorityScore)
      if (prop.formula.type === "number") {
        return prop.formula.number ?? 0;
      }
      return 0;
    default:
      return "";
  }
}

/**
 * Notion 페이지의 title 속성을 찾아서 반환한다.
 */
function getTitle(page: PageObjectResponse): string {
  const titleProp = Object.values(page.properties).find(
    (prop) => prop.type === "title",
  );
  if (!titleProp || titleProp.type !== "title") return "";
  return titleProp.title[0]?.plain_text ?? "";
}

// ------------------------------------------------------------
// Work Areas (업무 영역)
// ------------------------------------------------------------

/**
 * 업무 영역 목록을 조회한다. order 순으로 정렬.
 * ISR: 1일(86400초) 캐싱 (거의 변경 없음)
 */
export const getWorkAreas = unstable_cache(
  async (): Promise<WorkArea[]> => {
    const databaseId = process.env.NOTION_DB_WORK_AREAS;
    if (!databaseId) {
      console.warn("[Notion Work] NOTION_DB_WORK_AREAS 환경 변수가 없습니다.");
      return [];
    }

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "order",
            direction: "ascending",
          },
        ],
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => ({
          id: page.id,
          title: getTitle(page),
          icon: getProp(page, "icon") as string,
          color: getProp(page, "color") as string,
          order: getProp(page, "order") as number,
          description: getProp(page, "description") as string,
          weekTheme: getProp(page, "weekTheme") as string,
        }));
    } catch (error) {
      console.error("[Notion Work] 업무 영역 목록 조회 실패:", error);
      return [];
    }
  },
  ["work-areas-list"],
  { revalidate: 86400 },
);

// ------------------------------------------------------------
// Tasks (작업)
// ------------------------------------------------------------

/**
 * 작업 목록을 조회한다.
 * ISR: 10분(600초) 캐싱
 */
export const getTasks = unstable_cache(
  async (): Promise<Task[]> => {
    const databaseId = process.env.NOTION_DB_TASKS;
    if (!databaseId) {
      console.warn("[Notion Work] NOTION_DB_TASKS 환경 변수가 없습니다.");
      return [];
    }

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "dueDate",
            direction: "ascending",
          },
          {
            property: "priorityScore",
            direction: "descending",
          },
        ],
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => {
          // attachments JSON 파싱
          const attachmentsStr = getProp(page, "attachments") as string;
          let attachments: TaskAttachment[] | undefined;
          if (attachmentsStr) {
            try {
              attachments = JSON.parse(attachmentsStr);
            } catch {
              attachments = undefined;
            }
          }

          return {
            id: page.id,
            title: getTitle(page),
            status: getProp(page, "status") as Task["status"],
            workArea: getProp(page, "workArea") as string,
            priority: getProp(page, "priority") as Task["priority"],
            priorityScore: getProp(page, "priorityScore") as number,
            dueDate: getProp(page, "dueDate") as string,
            estimatedTime: getProp(page, "estimatedTime") as number,
            actualTime: getProp(page, "actualTime") as number,
            complexity: getProp(page, "complexity") as number,
            collaboration: getProp(page, "collaboration") as number,
            consequence: getProp(page, "consequence") as number,
            project: (getProp(page, "project") as string[])[0],
            assignedTo: (getProp(page, "assignedTo") as string[])[0],
            weekTheme: getProp(page, "weekTheme") as Task["weekTheme"],
            notes: getProp(page, "notes") as string,
            attachments,
            createdAt: page.created_time,
          };
        });
    } catch (error) {
      console.error("[Notion Work] 작업 목록 조회 실패:", error);
      return [];
    }
  },
  ["tasks-list"],
  { revalidate: 600 },
);

/**
 * ID로 작업을 조회한다.
 */
export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const client = getNotionClient();
    const page = await client.pages.retrieve({ page_id: id });
    if (!("properties" in page)) return null;

    const pageObj = page as PageObjectResponse;

    // attachments JSON 파싱
    const attachmentsStr = getProp(pageObj, "attachments") as string;
    let attachments: TaskAttachment[] | undefined;
    if (attachmentsStr) {
      try {
        attachments = JSON.parse(attachmentsStr);
      } catch {
        attachments = undefined;
      }
    }

    return {
      id: pageObj.id,
      title: getTitle(pageObj),
      status: getProp(pageObj, "status") as Task["status"],
      workArea: getProp(pageObj, "workArea") as string,
      priority: getProp(pageObj, "priority") as Task["priority"],
      priorityScore: getProp(pageObj, "priorityScore") as number,
      dueDate: getProp(pageObj, "dueDate") as string,
      estimatedTime: getProp(pageObj, "estimatedTime") as number,
      actualTime: getProp(pageObj, "actualTime") as number,
      complexity: getProp(pageObj, "complexity") as number,
      collaboration: getProp(pageObj, "collaboration") as number,
      consequence: getProp(pageObj, "consequence") as number,
      project: (getProp(pageObj, "project") as string[])[0],
      assignedTo: (getProp(pageObj, "assignedTo") as string[])[0],
      weekTheme: getProp(pageObj, "weekTheme") as Task["weekTheme"],
      notes: getProp(pageObj, "notes") as string,
      attachments,
      createdAt: pageObj.created_time,
    };
  } catch (error) {
    console.error(`[Notion Work] 작업 조회 실패 (${id}):`, error);
    return null;
  }
}

/**
 * 여러 작업을 ID 배열로 조회한다. (relation 헬퍼)
 */
async function getTasksByIds(ids: string[]): Promise<Task[]> {
  if (ids.length === 0) return [];

  const promises = ids.map((id) => getTaskById(id));
  const results = await Promise.all(promises);
  return results.filter((t): t is Task => t !== null);
}

// ------------------------------------------------------------
// Daily Plans (일일 계획)
// ------------------------------------------------------------

/**
 * 특정 날짜의 일일 계획을 조회한다.
 * ISR: 5분(300초) 캐싱
 */
export const getDailyPlanByDate = unstable_cache(
  async (date: string): Promise<DailyPlanWithTasks | null> => {
    const databaseId = process.env.NOTION_DB_DAILY_PLANS;
    if (!databaseId) {
      console.warn("[Notion Work] NOTION_DB_DAILY_PLANS 환경 변수가 없습니다.");
      return null;
    }

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
        filter: {
          property: "date",
          date: {
            equals: date,
          },
        },
      });

      const page = response.results[0];
      if (!page || !("properties" in page)) return null;

      const pageObj = page as PageObjectResponse;

      // Relation 데이터 조회
      const top3TaskIds = getProp(pageObj, "top3Tasks") as string[];
      const allTaskIds = getProp(pageObj, "allTasks") as string[];
      const [top3Tasks, allTasks] = await Promise.all([
        getTasksByIds(top3TaskIds),
        getTasksByIds(allTaskIds),
      ]);

      return {
        id: pageObj.id,
        title: getTitle(pageObj),
        date: getProp(pageObj, "date") as string,
        theme: getProp(pageObj, "theme") as DailyPlan["theme"],
        top3Tasks,
        allTasks,
        completionRate: getProp(pageObj, "completionRate") as number,
        totalTime: getProp(pageObj, "totalTime") as number,
        reflection: getProp(pageObj, "reflection") as string,
        createdAt: pageObj.created_time,
      };
    } catch (error) {
      console.error(`[Notion Work] 일일 계획 조회 실패 (${date}):`, error);
      return null;
    }
  },
  ["daily-plan-by-date"],
  { revalidate: 300 },
);

// ------------------------------------------------------------
// Weekly Reviews (주간 리뷰)
// ------------------------------------------------------------

/**
 * 주간 리뷰 목록을 조회한다. (최근 순)
 * ISR: 1시간(3600초) 캐싱
 */
export const getWeeklyReviews = unstable_cache(
  async (): Promise<WeeklyReview[]> => {
    const databaseId = process.env.NOTION_DB_WEEKLY_REVIEWS;
    if (!databaseId) {
      console.warn("[Notion Work] NOTION_DB_WEEKLY_REVIEWS 환경 변수가 없습니다.");
      return [];
    }

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "weekStart",
            direction: "descending",
          },
        ],
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => ({
          id: page.id,
          title: getTitle(page),
          weekStart: getProp(page, "weekStart") as string,
          weekEnd: getProp(page, "weekEnd") as string,
          totalTasks: getProp(page, "totalTasks") as number,
          completedTasks: getProp(page, "completedTasks") as number,
          completionRate: getProp(page, "completionRate") as number,
          totalTime: getProp(page, "totalTime") as number,
          workAreaBreakdown: getProp(page, "workAreaBreakdown") as string,
          topAchievements: getProp(page, "topAchievements") as string,
          nextWeekGoals: getProp(page, "nextWeekGoals") as string,
          createdAt: page.created_time,
        }));
    } catch (error) {
      console.error("[Notion Work] 주간 리뷰 목록 조회 실패:", error);
      return [];
    }
  },
  ["weekly-reviews-list"],
  { revalidate: 3600 },
);

// ------------------------------------------------------------
// Team Members (협업자)
// ------------------------------------------------------------

/**
 * 협업자 목록을 조회한다.
 * ISR: 30분(1800초) 캐싱
 */
export const getTeamMembers = unstable_cache(
  async (): Promise<TeamMember[]> => {
    const databaseId = process.env.NOTION_DB_TEAM;
    if (!databaseId) {
      console.warn("[Notion Work] NOTION_DB_TEAM 환경 변수가 없습니다.");
      return [];
    }

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => ({
          id: page.id,
          title: getTitle(page),
          role: getProp(page, "role") as TeamMember["role"],
          email: getProp(page, "email") as string,
          phone: getProp(page, "phone") as string,
          assignedTaskIds: getProp(page, "assignedTasks") as string[],
          completedTaskIds: getProp(page, "completedTasks") as string[],
          activeTasksCount: getProp(page, "activeTasksCount") as number,
          notes: getProp(page, "notes") as string,
          createdAt: page.created_time,
        }));
    } catch (error) {
      console.error("[Notion Work] 협업자 목록 조회 실패:", error);
      return [];
    }
  },
  ["team-members-list"],
  { revalidate: 1800 },
);

/**
 * ID로 협업자 상세를 조회한다. (작업 목록 포함)
 */
export async function getTeamMemberById(id: string): Promise<TeamMemberWithTasks | null> {
  try {
    const client = getNotionClient();
    const page = await client.pages.retrieve({ page_id: id });
    if (!("properties" in page)) return null;

    const pageObj = page as PageObjectResponse;

    // Relation 데이터 조회
    const assignedTaskIds = getProp(pageObj, "assignedTasks") as string[];
    const completedTaskIds = getProp(pageObj, "completedTasks") as string[];
    const [assignedTasks, completedTasks] = await Promise.all([
      getTasksByIds(assignedTaskIds),
      getTasksByIds(completedTaskIds),
    ]);

    return {
      id: pageObj.id,
      title: getTitle(pageObj),
      role: getProp(pageObj, "role") as TeamMember["role"],
      email: getProp(pageObj, "email") as string,
      phone: getProp(pageObj, "phone") as string,
      assignedTasks,
      completedTasks,
      activeTasksCount: getProp(pageObj, "activeTasksCount") as number,
      notes: getProp(pageObj, "notes") as string,
      createdAt: pageObj.created_time,
    };
  } catch (error) {
    console.error(`[Notion Work] 협업자 조회 실패 (${id}):`, error);
    return null;
  }
}

// ------------------------------------------------------------
// Projects (프로젝트)
// ------------------------------------------------------------

/**
 * 프로젝트 목록을 조회한다.
 * ISR: 30분(1800초) 캐싱
 */
export const getProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const databaseId = process.env.NOTION_DB_PROJECTS;
    if (!databaseId) {
      console.warn("[Notion Work] NOTION_DB_PROJECTS 환경 변수가 없습니다.");
      return [];
    }

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "status",
            direction: "ascending",
          },
        ],
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => ({
          id: page.id,
          title: getTitle(page),
          status: getProp(page, "status") as Project["status"],
          workArea: getProp(page, "workArea") as string,
          startDate: getProp(page, "startDate") as string,
          endDate: getProp(page, "endDate") as string,
          progress: getProp(page, "progress") as number,
          taskIds: getProp(page, "tasks") as string[],
          description: getProp(page, "description") as string,
          createdAt: page.created_time,
        }));
    } catch (error) {
      console.error("[Notion Work] 프로젝트 목록 조회 실패:", error);
      return [];
    }
  },
  ["projects-list"],
  { revalidate: 1800 },
);

/**
 * ID로 프로젝트 상세를 조회한다. (작업 목록 포함)
 */
export async function getProjectById(id: string): Promise<ProjectWithTasks | null> {
  try {
    const client = getNotionClient();
    const page = await client.pages.retrieve({ page_id: id });
    if (!("properties" in page)) return null;

    const pageObj = page as PageObjectResponse;

    // Relation 데이터 조회
    const taskIds = getProp(pageObj, "tasks") as string[];
    const tasks = await getTasksByIds(taskIds);

    return {
      id: pageObj.id,
      title: getTitle(pageObj),
      status: getProp(pageObj, "status") as Project["status"],
      workArea: getProp(pageObj, "workArea") as string,
      startDate: getProp(pageObj, "startDate") as string,
      endDate: getProp(pageObj, "endDate") as string,
      progress: getProp(pageObj, "progress") as number,
      tasks,
      description: getProp(pageObj, "description") as string,
      createdAt: pageObj.created_time,
    };
  } catch (error) {
    console.error(`[Notion Work] 프로젝트 조회 실패 (${id}):`, error);
    return null;
  }
}

// ------------------------------------------------------------
// Task Templates (작업 템플릿)
// ------------------------------------------------------------

/**
 * 작업 템플릿 목록을 조회한다.
 * ISR: 1시간(3600초) 캐싱
 */
export const getTaskTemplates = unstable_cache(
  async (): Promise<TaskTemplate[]> => {
    const databaseId = process.env.NOTION_DB_TASK_TEMPLATES;
    if (!databaseId) {
      console.warn("[Notion Work] NOTION_DB_TASK_TEMPLATES 환경 변수가 없습니다.");
      return [];
    }

    try {
      const client = getNotionClient();
      const response = await client.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "createdAt",
            direction: "descending",
          },
        ],
      });

      return response.results
        .filter((page: any): page is PageObjectResponse => "properties" in page)
        .map((page: PageObjectResponse) => {
          // checklist JSON 파싱
          const checklistStr = getProp(page, "checklist") as string;
          let checklist: ChecklistItem[] | undefined;
          if (checklistStr) {
            try {
              checklist = JSON.parse(checklistStr);
            } catch {
              checklist = undefined;
            }
          }

          return {
            id: page.id,
            title: getTitle(page),
            workArea: getProp(page, "workArea") as string,
            estimatedTime: getProp(page, "estimatedTime") as number,
            priority: getProp(page, "priority") as number,
            impact: getProp(page, "impact") as number,
            checklist,
            description: getProp(page, "description") as string,
            createdAt: page.created_time,
          };
        });
    } catch (error) {
      console.error("[Notion Work] 작업 템플릿 목록 조회 실패:", error);
      return [];
    }
  },
  ["task-templates-list"],
  { revalidate: 3600 },
);
