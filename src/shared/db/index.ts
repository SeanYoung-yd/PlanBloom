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

export function nowIso() {
  return new Date().toISOString();
}

export function createId() {
  return crypto.randomUUID();
}
