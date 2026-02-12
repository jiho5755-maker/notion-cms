// ============================================================
// 업무 일정 관리 시스템 — 타입 정의
// ============================================================

// ------------------------------------------------------------
// Work Area (업무 영역)
// ------------------------------------------------------------

export interface WorkArea {
  id: string;
  title: string;
  icon: string;
  color: string;
  order: number;
  description?: string;
  weekTheme?: string;
}

// ------------------------------------------------------------
// Task (작업)
// ------------------------------------------------------------

export type TaskStatus = "진행 전" | "진행 중" | "완료" | "보류";
export type TaskPriority = "긴급" | "높음" | "보통" | "낮음";
export type WeekTheme = "월요일" | "화요일" | "수요일" | "목요일" | "금요일" | "토요일" | "일요일";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  workArea: string;
  priority: TaskPriority;
  priorityScore: number; // Formula: complexity×20 + collaboration×20 + consequence×20
  dueDate: string;
  estimatedTime?: number; // 분 단위
  actualTime?: number; // 초 단위 (시간 추적 업데이트 시)
  complexity: number; // 1~5
  collaboration: number; // 1~5
  consequence: number; // 1~5
  project?: string; // Relation (Project ID)
  assignedTo?: string; // Relation (Team Member ID)
  weekTheme?: WeekTheme;
  notes?: string; // 마크다운
  attachments?: TaskAttachment[]; // 첨부파일
  createdAt: string;
}

// ------------------------------------------------------------
// Daily Plan (일일 계획)
// ------------------------------------------------------------

export interface DailyPlan {
  id: string;
  title: string;
  date: string;
  theme: WeekTheme;
  top3TaskIds: string[]; // Relation (Task IDs)
  allTaskIds: string[]; // Relation (Task IDs)
  completionRate?: number; // %
  totalTime?: number; // 분 단위
  reflection?: string;
  createdAt: string;
}

export interface DailyPlanWithTasks extends Omit<DailyPlan, "top3TaskIds" | "allTaskIds"> {
  top3Tasks: Task[];
  allTasks: Task[];
}

// ------------------------------------------------------------
// Weekly Review (주간 리뷰)
// ------------------------------------------------------------

export interface WeeklyReview {
  id: string;
  title: string;
  weekStart: string;
  weekEnd: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // %
  totalTime: number; // 분 단위
  workAreaBreakdown?: string; // Rich Text
  topAchievements?: string; // Rich Text
  nextWeekGoals?: string; // Rich Text
  createdAt: string;
}

// ------------------------------------------------------------
// Team Member (협업자)
// ------------------------------------------------------------

export type TeamRole = "웹디자이너" | "영상 편집자" | "강사";

export interface TeamMember {
  id: string;
  title: string;
  role: TeamRole;
  email?: string;
  phone?: string;
  assignedTaskIds: string[]; // Relation (Task IDs)
  completedTaskIds: string[]; // Relation (Task IDs)
  activeTasksCount: number; // Rollup
  notes?: string;
  createdAt: string;
}

export interface TeamMemberWithTasks extends Omit<TeamMember, "assignedTaskIds" | "completedTaskIds"> {
  assignedTasks: Task[];
  completedTasks: Task[];
}

// ------------------------------------------------------------
// Project (프로젝트)
// ------------------------------------------------------------

export type ProjectStatus = "기획" | "진행" | "완료" | "중단";

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  workArea: string;
  startDate?: string;
  endDate?: string;
  progress?: number; // 0~100%
  taskIds: string[]; // Relation (Task IDs)
  description?: string;
  createdAt: string;
}

export interface ProjectWithTasks extends Omit<Project, "taskIds"> {
  tasks: Task[];
}

// ------------------------------------------------------------
// Task Template (작업 템플릿)
// ------------------------------------------------------------

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TaskTemplate {
  id: string;
  title: string;
  workArea: string;
  estimatedTime: number; // 시간
  priority: number; // 1-10
  impact: number; // 1-10
  checklist?: ChecklistItem[];
  description?: string;
  createdAt: string;
}

export interface TaskTemplateInput {
  title: string;
  workArea: string;
  estimatedTime: number;
  priority: number;
  impact: number;
  checklist?: ChecklistItem[];
  description?: string;
}

// ------------------------------------------------------------
// Task Attachment (작업 첨부파일)
// ------------------------------------------------------------

export interface TaskAttachment {
  url: string;
  name: string;
  size: number; // bytes
  uploadedAt: string; // ISO 8601
}

// ------------------------------------------------------------
// Filter Options (검색/필터)
// ------------------------------------------------------------

export interface FilterOptions {
  workArea?: string;
  status?: TaskStatus;
  priorityGrade?: "A" | "B" | "C" | "D";
  assignee?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// ------------------------------------------------------------
// Server Actions 입력 타입
// ------------------------------------------------------------

/**
 * 빠른 작업 생성 (모바일 입력용)
 */
export interface QuickTaskInput {
  title: string;
  dueDate: string;
}

/**
 * 전체 작업 생성
 */
export interface TaskInput {
  title: string;
  workArea: string;
  dueDate: string;
  priority?: TaskPriority;
  estimatedTime?: number;
  complexity?: number; // 기본값: 3
  collaboration?: number; // 기본값: 2
  consequence?: number; // 기본값: 3
  weekTheme?: WeekTheme;
  notes?: string;
  assignedTo?: string;
  project?: string;
}

/**
 * 작업 수정
 */
export interface TaskUpdate {
  id: string;
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  complexity?: number;
  collaboration?: number;
  consequence?: number;
  notes?: string;
  assignedTo?: string;
}

/**
 * 일일 계획 생성 입력
 */
export interface DailyPlanInput {
  date: string;
  theme: WeekTheme;
  top3TaskIds: string[];
}

/**
 * 주간 리뷰 생성 입력
 */
export interface WeeklyReviewInput {
  weekStart: string;
  weekEnd: string;
}

/**
 * 협업자 생성 입력
 */
export interface TeamMemberInput {
  title: string;
  role: TeamRole;
  email?: string;
  phone?: string;
  notes?: string;
}

/**
 * 협업자 수정
 */
export interface TeamMemberUpdate {
  id: string;
  title?: string;
  role?: TeamRole;
  email?: string;
  phone?: string;
  notes?: string;
}

// ------------------------------------------------------------
// 통계 및 대시보드
// ------------------------------------------------------------

/**
 * 업무 영역별 통계
 */
export interface WorkAreaStats {
  workArea: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalTime: number;
}

/**
 * 대시보드 KPI
 */
export interface DashboardStats {
  today: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    remainingTime: number; // 분 단위
  };
  week: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalTime: number;
  };
  month: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalTime: number;
  };
  workAreaBreakdown: WorkAreaStats[];
}

// ------------------------------------------------------------
// 상수 맵
// ------------------------------------------------------------

/**
 * 작업 상태 라벨
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  "진행 전": "진행 전",
  "진행 중": "진행 중",
  "완료": "완료",
  "보류": "보류",
};

/**
 * 작업 상태 색상
 */
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  "진행 전": "bg-gray-100 text-gray-700",
  "진행 중": "bg-blue-100 text-blue-700",
  "완료": "bg-green-100 text-green-700",
  "보류": "bg-yellow-100 text-yellow-700",
};

/**
 * 우선순위 라벨
 */
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  "긴급": "긴급",
  "높음": "높음",
  "보통": "보통",
  "낮음": "낮음",
};

/**
 * 우선순위 색상
 */
export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  "긴급": "bg-red-100 text-red-700",
  "높음": "bg-orange-100 text-orange-700",
  "보통": "bg-blue-100 text-blue-700",
  "낮음": "bg-gray-100 text-gray-700",
};

/**
 * 요일 테마 라벨
 */
export const WEEK_THEME_LABELS: Record<WeekTheme, string> = {
  "월요일": "제품의 날 🛠️",
  "화요일": "마케팅의 날 📣",
  "수요일": "개발의 날 💻",
  "목요일": "사람의 날 👥",
  "금요일": "정리의 날 💰",
  "토요일": "휴식의 날 🌴",
  "일요일": "휴식의 날 🌴",
};

/**
 * 요일 테마 색상
 */
export const WEEK_THEME_COLORS: Record<WeekTheme, string> = {
  "월요일": "bg-blue-100 text-blue-700",
  "화요일": "bg-red-100 text-red-700",
  "수요일": "bg-gray-100 text-gray-700",
  "목요일": "bg-purple-100 text-purple-700",
  "금요일": "bg-green-100 text-green-700",
  "토요일": "bg-yellow-100 text-yellow-700",
  "일요일": "bg-yellow-100 text-yellow-700",
};

/**
 * 우선순위 점수 등급 계산
 */
export function getPriorityGrade(score: number): "A" | "B" | "C" | "D" {
  if (score >= 60) return "A";
  if (score >= 40) return "B";
  if (score >= 20) return "C";
  return "D";
}

/**
 * 우선순위 등급 라벨
 */
export const PRIORITY_GRADE_LABELS = {
  A: "A급 (당일 필수)",
  B: "B급 (주간 목표)",
  C: "C급 (월간 목표)",
  D: "D급 (보류/삭제)",
};

/**
 * 우선순위 등급 색상
 */
export const PRIORITY_GRADE_COLORS = {
  A: "bg-red-100 text-red-700 border-red-300",
  B: "bg-orange-100 text-orange-700 border-orange-300",
  C: "bg-blue-100 text-blue-700 border-blue-300",
  D: "bg-gray-100 text-gray-700 border-gray-300",
};
