## PlanBloom 本地日常计划应用 - 设计提示词方案

本文档是一套可直接分阶段交给 QoderWork 使用的 AI 辅助开发提示词。它基于原 TripBloom 方案改写，产品方向从“行程规划”调整为“本地日常计划程序”，核心功能聚焦：日度计划、月度计划、年度计划、习惯贴纸打卡、月度总结和年度总结。

---

### 1. 项目概述与技术决策

**产品定位**：PlanBloom 是一款本地优先的个人日常计划程序。它帮助用户用轻量、直观、元气的方式安排每天的任务、规划每月目标、拆解年度方向，并通过“在月历上贴贴纸”的习惯打卡方式让坚持变得更有趣。

**体验关键词**：

- 简洁：首屏直接进入今日计划，不做复杂仪表盘和学习成本高的配置。
- 元气：糖果色、贴纸、轻快动效，但不堆装饰，不影响计划效率。
- 容易上手：所有创建动作都从明显的 “+” 或日期格点击开始。
- 本地优先：所有数据保存在浏览器 IndexedDB，无账号、无后端。

**技术栈**：

- 框架：React 18 + TypeScript + Vite
- 状态管理：Zustand
- 数据持久化：Dexie.js（IndexedDB 封装）
- 样式：TailwindCSS + CSS Variables
- 动画：Framer Motion
- 图表：Recharts
- 路由：React Router v6
- 图标：Lucide React
- 日期处理：date-fns
- 数据校验：Zod
- 导出：html2canvas（用于年度报告长图）

**项目结构**：

```text
src/
├── features/
│   ├── dashboard/          # 今日概览
│   ├── daily-plan/         # 日度计划
│   ├── monthly-plan/       # 月度计划
│   ├── yearly-plan/        # 年度计划
│   ├── habit-tracker/      # 习惯贴纸打卡
│   ├── monthly-summary/    # 月度总结
│   ├── yearly-summary/     # 年度总结
│   └── settings/           # 本地设置、导入导出
├── shared/
│   ├── components/         # 通用 UI 组件
│   ├── hooks/              # 通用 hooks
│   ├── db/                 # Dexie 数据库定义
│   ├── schemas/            # Zod schemas
│   ├── utils/              # 日期、统计、导入导出工具
│   └── stickers/           # 预设贴纸常量
├── layouts/
│   ├── AppShell.tsx
│   └── BottomTabBar.tsx
├── App.tsx
└── main.tsx
```

---

### 2. 数据模型（Zod Schema + Dexie 表定义）

所有 ID 使用 `crypto.randomUUID()` 生成。日期字段统一使用字符串：日期为 `yyyy-MM-dd`，月份为 `yyyy-MM`，年份为 `yyyy`，时间戳为 ISO 8601。

```typescript
// ===== shared/schemas/index.ts =====
import { z } from "zod";

export const PrioritySchema = z.enum(["high", "medium", "low"]);
export const GoalCategorySchema = z.enum([
  "work",
  "life",
  "health",
  "learn",
  "finance",
  "relationship",
  "creative",
  "other",
]);

// ---------- 设置 ----------
export const SettingsSchema = z.object({
  id: z.literal("default"),
  userName: z.string().optional(),
  weekStartsOn: z.enum(["monday", "sunday"]).default("monday"),
  theme: z.enum(["fresh", "sunny", "mint"]).default("fresh"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ---------- 日度计划 ----------
export const DailyTaskSchema = z.object({
  id: z.string(),
  date: z.string(),                 // "2026-07-11"
  title: z.string().min(1),
  note: z.string().optional(),
  startTime: z.string().optional(), // "09:00"
  endTime: z.string().optional(),   // "10:30"
  priority: PrioritySchema.default("medium"),
  completed: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const DailyNoteSchema = z.object({
  id: z.string(),
  date: z.string(),
  content: z.string().default(""),
  mood: z.enum(["great", "good", "okay", "tired"]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ---------- 月度计划 ----------
export const MonthlyGoalSchema = z.object({
  id: z.string(),
  yearMonth: z.string(),            // "2026-07"
  title: z.string().min(1),
  description: z.string().optional(),
  category: GoalCategorySchema.default("other"),
  progress: z.number().min(0).max(100).default(0),
  completed: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MonthlyEventSchema = z.object({
  id: z.string(),
  yearMonth: z.string(),
  date: z.string(),
  title: z.string().min(1),
  type: z.enum(["event", "deadline", "birthday", "reminder"]).default("event"),
  color: z.string().default("#06b6d4"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ---------- 年度计划 ----------
export const YearlyGoalSchema = z.object({
  id: z.string(),
  year: z.string(),                 // "2026"
  title: z.string().min(1),
  description: z.string().optional(),
  category: GoalCategorySchema.default("other"),
  targetMonth: z.string().optional(), // "2026-09"
  progress: z.number().min(0).max(100).default(0),
  completed: z.boolean().default(false),
  completedDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ---------- 习惯打卡 ----------
export const HabitSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  stickerId: z.string(),
  stickerEmoji: z.string(),
  color: z.string(),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
  weeklyTarget: z.number().min(1).max(7).optional(),
  createdAt: z.string(),
  archivedAt: z.string().optional(),
});

export const HabitCheckinSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
});

// ---------- 贴纸预设库（硬编码常量，不入数据库） ----------
export const PRESET_STICKERS = [
  { id: "exercise", emoji: "🏃", name: "运动", color: "#ef4444" },
  { id: "reading", emoji: "📖", name: "阅读", color: "#3b82f6" },
  { id: "water", emoji: "💧", name: "喝水", color: "#06b6d4" },
  { id: "sleep", emoji: "😴", name: "早睡", color: "#6366f1" },
  { id: "journal", emoji: "📝", name: "日记", color: "#f59e0b" },
  { id: "meditation", emoji: "🧘", name: "冥想", color: "#8b5cf6" },
  { id: "walk", emoji: "🚶", name: "散步", color: "#22c55e" },
  { id: "study", emoji: "📚", name: "学习", color: "#14b8a6" },
  { id: "music", emoji: "🎵", name: "音乐", color: "#ec4899" },
  { id: "draw", emoji: "🎨", name: "绘画", color: "#a855f7" },
  { id: "cook", emoji: "🍳", name: "做饭", color: "#f97316" },
  { id: "no-screen", emoji: "📵", name: "少看手机", color: "#64748b" },
  { id: "fruit", emoji: "🍎", name: "吃水果", color: "#dc2626" },
  { id: "stretch", emoji: "🤸", name: "拉伸", color: "#10b981" },
  { id: "gratitude", emoji: "🙏", name: "感恩", color: "#eab308" },
  { id: "custom", emoji: "⭐", name: "自定义", color: "#f472b6" },
] as const;

// ---------- 月度/年度总结 ----------
export const MonthlySummarySchema = z.object({
  id: z.string(),
  yearMonth: z.string(),
  mood: z.enum(["great", "good", "okay", "tired"]).optional(),
  highlights: z.array(z.string()).default([]),
  reflection: z.string().default(""),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const YearlySummarySchema = z.object({
  id: z.string(),
  year: z.string(),
  yearlyWord: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  reflection: z.string().default(""),
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

```typescript
// ===== shared/db/index.ts =====
import Dexie, { type Table } from "dexie";
import { z } from "zod";
import {
  DailyNoteSchema,
  DailyTaskSchema,
  HabitCheckinSchema,
  HabitSchema,
  MonthlyEventSchema,
  MonthlyGoalSchema,
  MonthlySummarySchema,
  SettingsSchema,
  YearlyGoalSchema,
  YearlySummarySchema,
} from "../schemas";

export type Settings = z.infer<typeof SettingsSchema>;
export type DailyTask = z.infer<typeof DailyTaskSchema>;
export type DailyNote = z.infer<typeof DailyNoteSchema>;
export type MonthlyGoal = z.infer<typeof MonthlyGoalSchema>;
export type MonthlyEvent = z.infer<typeof MonthlyEventSchema>;
export type YearlyGoal = z.infer<typeof YearlyGoalSchema>;
export type Habit = z.infer<typeof HabitSchema>;
export type HabitCheckin = z.infer<typeof HabitCheckinSchema>;
export type MonthlySummary = z.infer<typeof MonthlySummarySchema>;
export type YearlySummary = z.infer<typeof YearlySummarySchema>;

export class PlanBloomDB extends Dexie {
  settings!: Table<Settings>;
  dailyTasks!: Table<DailyTask>;
  dailyNotes!: Table<DailyNote>;
  monthlyGoals!: Table<MonthlyGoal>;
  monthlyEvents!: Table<MonthlyEvent>;
  yearlyGoals!: Table<YearlyGoal>;
  habits!: Table<Habit>;
  habitCheckins!: Table<HabitCheckin>;
  monthlySummaries!: Table<MonthlySummary>;
  yearlySummaries!: Table<YearlySummary>;

  constructor() {
    super("planbloom");
    this.version(1).stores({
      settings: "id",
      dailyTasks: "id, date, completed, [date+completed]",
      dailyNotes: "id, date",
      monthlyGoals: "id, yearMonth, category, completed",
      monthlyEvents: "id, yearMonth, date, type",
      yearlyGoals: "id, year, category, completed, targetMonth",
      habits: "id, archivedAt",
      habitCheckins: "id, habitId, date, [habitId+date]",
      monthlySummaries: "id, yearMonth",
      yearlySummaries: "id, year",
    });
  }
}

export const db = new PlanBloomDB();
```

---

### 3. 路由与页面架构

```typescript
// ===== App.tsx 路由结构 =====
// /                         -> 今日概览 Dashboard
// /daily/:date?             -> 日度计划，默认今天
// /monthly/:yearMonth?      -> 月度计划，默认当月
// /yearly/:year?            -> 年度计划，默认当年
// /habits                   -> 习惯列表
// /habits/:habitId          -> 单个习惯贴纸月历
// /summary/monthly/:yearMonth? -> 月度总结
// /summary/yearly/:year?       -> 年度总结
// /settings                 -> 设置、导入导出
```

**布局设计**：

- 使用 `AppShell` 承载主内容和底部导航。
- 底部 Tab 为：今日、月历、年度、习惯、总结。
- 总结 Tab 点击后默认进入当月总结，页面内用分段控件切换“月度 / 年度”。
- 桌面端最大内容宽度建议为 960px，居中显示；移动端全宽。
- 常用操作按钮固定在页面右下角，使用图标按钮或图标+短文本。

---

### 4. 视觉风格指南（简洁元气）

**配色体系**：

```css
:root {
  --color-primary: #14b8a6;
  --color-primary-soft: #ccfbf1;
  --color-coral: #fb7185;
  --color-sky: #38bdf8;
  --color-yellow: #facc15;
  --color-lilac: #a78bfa;
  --color-mint: #34d399;

  --color-bg: #fffdf7;
  --color-surface: #ffffff;
  --color-surface-soft: #f8fafc;
  --color-text: #1f2937;
  --color-text-muted: #64748b;
  --color-border: #e5e7eb;

  --radius-card: 8px;
  --radius-control: 8px;
  --radius-pill: 9999px;

  --shadow-soft: 0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-sticker: 0 3px 8px rgba(15, 23, 42, 0.16);
}
```

**界面原则**：

- 页面第一屏必须直接可用，不做营销式首页。
- 卡片只用于列表项、统计项、编辑面板，不要把整个页面包成大卡片。
- 页面顶部标题简短，例如“今天”、“7月计划”、“2026 年”。
- 元气感主要来自贴纸、颜色、微动效和亲切文案，不用大面积渐变背景。
- 常用操作使用 Lucide 图标，例如 `Plus`、`Check`、`ChevronLeft`、`CalendarDays`、`Smile`、`Download`、`Upload`。

**动效原则**：

- 页面切换：150ms 到 250ms 的淡入和轻微位移。
- 贴纸打卡：scale 0 -> 1.15 -> 1，轻微旋转，200ms。
- 勾选任务：勾选框缩放反馈，文字淡出到划线状态。
- 新增列表项：从下方 8px 处淡入。
- 动效不阻塞操作，所有关键操作要立即更新 UI。

---

### 5. 各功能模块详细设计

#### 5.1 今日概览 Dashboard

**Prompt**：

> 请实现今日概览页面（路由 `/`）。页面要简洁、元气、容易上手，不要做营销首页。
>
> 页面从上到下包含：
>
> 1. **问候区**：展示“早上好/下午好/晚上好，[用户名]”，旁边显示今天日期和星期。首次打开应用时，引导用户填写用户名，也允许跳过。
> 2. **今日重点**：展示一个可编辑的单行输入框，用来写今天最重要的一件事。数据可存入当天 `DailyNote` 或单独字段。
> 3. **今日任务**：展示今天的 `DailyTask`，支持勾选完成、快速新增、点击编辑。最多显示 6 条，更多时提供进入日度计划的链接。
> 4. **今日习惯贴纸**：横向展示所有活跃习惯的贴纸。点击贴纸可直接完成或取消今天打卡。已打卡贴纸显示更饱满的颜色和轻微弹跳反馈。
> 5. **本月目标进度**：显示当月 `MonthlyGoal` 的总体完成率和前 3 个目标。
>
> 数据从 Dexie 读取，封装 hooks：`useTodayTasks`、`useTodayHabits`、`useMonthlyGoalProgress`、`useSettings`。

#### 5.2 日度计划

**Prompt**：

> 请实现日度计划页面（路由 `/daily/:date?`），默认展示今天。
>
> **页面结构**：
> - 顶部：日期切换器，包含左箭头、当前日期、右箭头、回到今天按钮。
> - 主体：分为“时间安排”和“待办清单”两块。
> - 时间安排：显示 06:00 到 23:00 的时间轴。有 `startTime` 和 `endTime` 的任务显示在对应时间段。
> - 待办清单：无时间任务集中显示，支持勾选、编辑、删除。
> - 底部：当日随手记 `DailyNote`，使用 textarea 自动保存。
>
> **任务编辑**：
> - 点击空白时间格：快速创建任务，并预填开始时间。
> - 点击任务：打开 `BottomSheet`，可编辑标题、时间、优先级、备注、标签。
> - 任务支持完成/取消完成、删除、复制到明天。
>
> **视觉**：
> - 高优先级使用珊瑚色，中优先级使用黄色，低优先级使用薄荷色。
> - 完成任务文字变浅并添加划线。
> - 空状态显示“今天还没有安排，先写下一件小事吧。”

#### 5.3 月度计划

**Prompt**：

> 请实现月度计划页面（路由 `/monthly/:yearMonth?`），默认展示当月。
>
> **页面结构**：
> - 顶部：月份切换器和“新目标”按钮。
> - 核心：月历网格，7 列、5 到 6 行。
> - 日期格：左上角显示日期，今天有主色描边；有事件的日期显示最多 3 个彩色点；有已完成任务的日期显示一个小勾标记。
> - 月历下方：当月目标列表，每个目标展示分类图标、标题、进度条和完成状态。
>
> **交互**：
> - 点击日期格：弹出当天摘要 Sheet，展示当天任务、事件和习惯打卡数量，并提供“添加事件”和“打开日计划”操作。
> - 点击目标：打开编辑 Sheet。
> - 点击“新目标”：创建 `MonthlyGoal`。
> - 支持左右切换月份。
>
> **月度事件**：
> - `MonthlyEvent` 用于生日、截止日、提醒等轻量事件。
> - 事件不是任务，不要求完成状态，只用于月历提醒。

#### 5.4 年度计划

**Prompt**：

> 请实现年度计划页面（路由 `/yearly/:year?`），默认展示当年。
>
> **页面结构**：
> - 顶部：年份切换器 + 年度关键词输入框，例如“稳定生长”。
> - 视图切换：使用分段控件切换“时间轴 / 分类”。
>
> **时间轴视图**：
> - 12 个月纵向排列。
> - 每个月显示该月目标和里程碑。
> - 当前月份高亮。
> - 完成的年度目标显示实心勾选标记，未完成显示空心标记。
>
> **分类视图**：
> - 按 work、life、health、learn、finance、relationship、creative、other 分类。
> - 每个分类是一列或一个分组，展示对应 `YearlyGoal`。
> - 目标卡片显示标题、目标月份、进度和完成按钮。
>
> **交互**：
> - 右下角 “+” 添加年度目标。
> - 点击目标打开编辑 Sheet。
> - 标记完成时播放轻量 confetti。

#### 5.5 习惯贴纸打卡（核心亮点）

**Prompt**：

> 请实现习惯打卡功能（路由 `/habits` 和 `/habits/:habitId`）。这是应用最有记忆点的功能，重点是“在月历上贴贴纸”的感觉。
>
> **习惯列表页 `/habits`**：
> - 顶部标题：“习惯贴纸”。
> - 展示所有活跃习惯。每个习惯项包含贴纸、习惯名、本周进度（例如 5/7）、连续天数。
> - 右下角 “+” 打开贴纸选择面板。
> - 贴纸选择面板展示 `PRESET_STICKERS`，选中后输入习惯名并创建。
>
> **习惯详情页 `/habits/:habitId`**：
> - 顶部显示大贴纸、习惯名、连续打卡天数、月份切换器。
> - 核心区域是月历打卡网格。
> - 已打卡的日期格子上显示该习惯贴纸，像贴在日历上一样。
> - 今天如果未打卡，显示虚线贴纸占位符，点击即可打卡。
> - 过去未打卡日期保持干净空白。
> - 下方显示本月统计：打卡天数、打卡率、最长连续天数。
>
> **贴纸视觉**：
> - 圆形，36px，2px 白色描边。
> - 背景色使用贴纸 `color` 的浅色版本。
> - emoji 居中，字号 18px。
> - 已贴贴纸带轻微阴影和随机旋转（-5 到 +5 度），旋转值应基于 habitId + date 稳定生成，避免每次渲染跳动。
>
> **交互**：
> - 点击今天占位符：创建 `HabitCheckin`，播放贴上动画。
> - 点击已贴贴纸：取消打卡。
> - 长按或右键贴纸：打开备注输入。
> - 所有打卡操作应乐观更新 UI。

#### 5.6 月度总结

**Prompt**：

> 请实现月度总结页面（路由 `/summary/monthly/:yearMonth?`），默认展示当月。
>
> **页面结构**：
> - 顶部：月份切换器 + 心情选择器（great/good/okay/tired）。
> - 数据概览：完成任务数、习惯打卡总次数、月目标完成率、记录天数。
> - 习惯热力图：月历形式展示每天习惯打卡数量，颜色越深表示打卡越多。
> - 目标回顾：展示当月目标完成情况。
> - 月度亮点：可添加多个短文本标签。
> - 月度感悟：textarea，500ms debounce 自动保存到 `MonthlySummary.reflection`。
>
> **数据聚合**：
> - 从 `dailyTasks` 统计当月完成任务。
> - 从 `habitCheckins` 统计每日打卡数量和总打卡次数。
> - 从 `monthlyGoals` 统计完成率。
> - 聚合逻辑封装为 `useMonthlyStats(yearMonth)`。

#### 5.7 年度总结

**Prompt**：

> 请实现年度总结页面（路由 `/summary/yearly/:year?`），默认展示当年。
>
> **页面结构**：
> - 顶部：年份切换器 + 年度关键词。
> - 年度数据：全年完成任务数、全年打卡次数、年度目标完成率、最佳习惯。
> - 年度活跃热力图：12 个月 × 每月天数，颜色表示每天的任务完成和习惯打卡综合活跃度。
> - 习惯年度排行：柱状图展示每个习惯全年打卡天数。
> - 年度目标回顾：完成和未完成目标分组展示。
> - 年度亮点：可添加多个短文本标签。
> - 年度感悟：textarea 自动保存。
> - 生成年度报告：使用 html2canvas 导出当前年度总结区域为 PNG。
>
> **数据聚合**：
> - 封装 `useYearlyStats(year)`。
> - 统计任务、习惯、年度目标和每月活跃度。

---

### 6. 通用组件清单

| 组件名 | 路径 | 说明 |
|--------|------|------|
| `AppShell` | `layouts/AppShell.tsx` | 主布局，承载内容区和底部导航 |
| `BottomTabBar` | `layouts/BottomTabBar.tsx` | 底部 5 Tab 导航 |
| `PageHeader` | `shared/components/PageHeader.tsx` | 页面标题、日期切换、操作区 |
| `Card` | `shared/components/Card.tsx` | 通用卡片，圆角 8px |
| `IconButton` | `shared/components/IconButton.tsx` | 带 tooltip 的图标按钮 |
| `FloatingActionButton` | `shared/components/FAB.tsx` | 右下角新增按钮 |
| `BottomSheet` | `shared/components/BottomSheet.tsx` | 底部弹出编辑面板 |
| `SegmentedControl` | `shared/components/SegmentedControl.tsx` | 月度/年度、时间轴/分类切换 |
| `StickerBadge` | `shared/components/StickerBadge.tsx` | 贴纸组件 |
| `StickerPicker` | `shared/components/StickerPicker.tsx` | 贴纸选择器 |
| `CalendarGrid` | `shared/components/CalendarGrid.tsx` | 月历网格基础组件 |
| `ProgressBar` | `shared/components/ProgressBar.tsx` | 进度条 |
| `EmptyState` | `shared/components/EmptyState.tsx` | 空状态 |
| `TagInput` | `shared/components/TagInput.tsx` | 亮点和标签输入 |
| `ConfirmDialog` | `shared/components/ConfirmDialog.tsx` | 删除、导入确认 |

---

### 7. 开发阶段与实施顺序

**Phase 1 - 基础骨架**

> Prompt: "请初始化 React + TypeScript + Vite 项目，应用名为 PlanBloom。安装依赖：dexie、zustand、tailwindcss、framer-motion、react-router-dom、date-fns、lucide-react、recharts、zod、html2canvas。配置路由、Tailwind、CSS Variables 和 AppShell。创建 Dexie 数据库、Zod schemas、基础 hooks，并实现 BottomTabBar、PageHeader、Card、IconButton、BottomSheet、EmptyState。每个路由先放占位页面。"

**Phase 2 - 日度计划和今日概览**

> Prompt: "请实现日度计划和今日概览。包含 DailyTask CRUD hooks、DailyNote 自动保存、今日任务列表、时间轴视图、待办清单、任务编辑 BottomSheet、今日习惯快捷打卡入口、本月目标进度。确保首页打开即可添加任务和打卡。"

**Phase 3 - 月度计划**

> Prompt: "请实现月度计划。包含 CalendarGrid、月份切换、MonthlyGoal CRUD、MonthlyEvent CRUD、日期格摘要 Sheet、当日任务和事件提示、目标进度展示。月历交互要简洁，点击日期即可看当天摘要并跳转日计划。"

**Phase 4 - 习惯贴纸打卡**

> Prompt: "请实现习惯贴纸打卡。包含 Habit CRUD、预设贴纸库、StickerBadge、StickerPicker、习惯列表页、习惯详情月历打卡页、打卡/取消打卡、备注、连续天数、本月统计。重点做好贴纸贴到月历上的视觉和动画。"

**Phase 5 - 年度计划**

> Prompt: "请实现年度计划。包含 YearlyGoal CRUD、年度关键词、时间轴视图、分类视图、目标进度、完成状态、完成时轻量 confetti。"

**Phase 6 - 月度总结和年度总结**

> Prompt: "请实现月度总结和年度总结。包含 useMonthlyStats、useYearlyStats、数据概览卡、习惯热力图、年度活跃热力图、习惯排行柱状图、亮点 TagInput、感悟自动保存、年度报告 PNG 导出。"

**Phase 7 - 设置、导入导出和体验润色**

> Prompt: "请实现设置页和收尾体验。包含用户名设置、周起始日设置、主题选择、JSON 导出和导入、删除确认、空状态文案、键盘可访问性、响应式适配。检查 360px、768px、1440px 宽度下布局不重叠，按钮文字不溢出。"

---

### 8. 补充设计要点

**导入导出**：设置页提供“导出数据”和“导入数据”。导出文件名为 `planbloom-backup-{yyyy-MM-dd}.json`，包含所有表。导入前显示确认弹窗，说明会覆盖本地数据。

**本地优先**：不实现登录，不请求后端 API。所有读写来自 Dexie，创建和更新操作使用乐观 UI。

**可访问性**：所有按钮有 `aria-label`。图标按钮提供 tooltip。颜色对比度符合 WCAG AA。支持键盘 Tab 导航和 Enter/Space 触发。

**性能**：月历和年度热力图数据应通过 memoized selector 或 `useMemo` 聚合，避免每次输入文本都重算全年统计。

**错误处理**：Dexie 写入失败时显示轻量 toast，并回滚乐观更新。

---

### 9. 快速启动 Prompt（一句话版）

> 请用 React + TypeScript + Vite 创建一个名为 PlanBloom 的本地日常计划应用。应用本地优先，使用 Dexie.js/IndexedDB 保存数据，无需账号和后端。技术栈包含 Zustand、TailwindCSS、Framer Motion、React Router v6、date-fns、Lucide React、Recharts、Zod、html2canvas。核心功能包括：日度计划（时间轴、待办清单、随手记）、月度计划（月历、月目标、轻量事件）、年度计划（年度关键词、时间轴、分类目标）、习惯打卡（每个习惯通过在月历上贴贴纸完成打卡，提供 16 个常见习惯贴纸）、月度总结（任务、习惯、目标统计、热力图、感悟）、年度总结（年度统计、习惯排行、年度目标回顾、报告导出）。视觉风格简洁元气，使用清爽底色、糖果色点缀、8px 圆角卡片、贴纸动效和清晰图标按钮。请先搭建项目骨架、数据模型、路由和通用组件，再按日度、月度、习惯、年度、总结、设置的顺序逐步实现。

---

*本文档由 Codex 根据原 TripBloom 提示词方案改写，版本 2.0.0 - 2026-07-11*
