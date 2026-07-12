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

export const SettingsSchema = z.object({
  id: z.literal("default"),
  userName: z.string().optional(),
  weekStartsOn: z.enum(["monday", "sunday"]).default("monday"),
  theme: z.enum(["fresh", "sunny", "mint"]).default("fresh"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const DailyTaskSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string().min(1),
  note: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  priority: PrioritySchema.default("medium"),
  completed: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const DailyNoteSchema = z.object({
  id: z.string(),
  date: z.string(),
  focus: z.string().default(""),
  content: z.string().default(""),
  mood: z.enum(["great", "good", "okay", "tired"]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MonthlyGoalSchema = z.object({
  id: z.string(),
  yearMonth: z.string(),
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

export const YearlyGoalSchema = z.object({
  id: z.string(),
  year: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: GoalCategorySchema.default("other"),
  targetMonth: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  completed: z.boolean().default(false),
  completedDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

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

export type Priority = z.infer<typeof PrioritySchema>;
export type GoalCategory = z.infer<typeof GoalCategorySchema>;
