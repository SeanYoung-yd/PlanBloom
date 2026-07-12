import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns";
import { db, createId, nowIso, type DailyTask, type Habit, type HabitCheckin, type MonthlyGoal, type MonthlySummary, type Settings, type YearlyGoal, type YearlySummary } from "../db";
import { touchData } from "../store/dataVersion";
import { monthKey, todayKey, yearKey } from "../utils/dates";
import { useDbQuery } from "./useDbQuery";
import type { GoalCategory, Priority } from "../schemas";

export function useSettings() {
  const defaultSettings: Settings = {
    id: "default",
    weekStartsOn: "monday",
    theme: "fresh",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const result = useDbQuery(async () => {
    const settings = await db.settings.get("default");
    if (settings) return settings;
    const now = nowIso();
    const next: Settings = { id: "default", weekStartsOn: "monday", theme: "fresh", createdAt: now, updatedAt: now };
    await db.settings.put(next);
    return next;
  }, [], defaultSettings);

  async function updateSettings(patch: Partial<typeof result.data>) {
    await db.settings.put({ ...result.data, ...patch, id: "default", updatedAt: nowIso() });
    touchData();
  }

  return { ...result, updateSettings };
}

export function useDailyTasks(date: string) {
  const result = useDbQuery(() => db.dailyTasks.where("date").equals(date).sortBy("createdAt"), [date], [] as DailyTask[]);

  async function addTask(input: { title: string; startTime?: string; endTime?: string; priority?: Priority; note?: string }) {
    const now = nowIso();
    await db.dailyTasks.add({
      id: createId(),
      date,
      title: input.title,
      note: input.note,
      startTime: input.startTime,
      endTime: input.endTime,
      priority: input.priority ?? "medium",
      completed: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
    });
    touchData();
  }

  async function updateTask(id: string, patch: Partial<DailyTask>) {
    await db.dailyTasks.update(id, { ...patch, updatedAt: nowIso() });
    touchData();
  }

  async function deleteTask(id: string) {
    await db.dailyTasks.delete(id);
    touchData();
  }

  async function copyToTomorrow(task: DailyTask) {
    const now = nowIso();
    await db.dailyTasks.add({
      ...task,
      id: createId(),
      date: format(addDays(parseISO(task.date), 1), "yyyy-MM-dd"),
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
    touchData();
  }

  return { ...result, addTask, updateTask, deleteTask, copyToTomorrow };
}

export const useTodayTasks = () => useDailyTasks(todayKey());

export function useDailyNote(date: string) {
  const result = useDbQuery(async () => {
    const existing = await db.dailyNotes.where("date").equals(date).first();
    if (existing) return existing;
    const now = nowIso();
    const note = { id: createId(), date, focus: "", content: "", createdAt: now, updatedAt: now };
    await db.dailyNotes.add(note);
    return note;
  }, [date], { id: "", date, focus: "", content: "", createdAt: "", updatedAt: "" });

  async function updateNote(patch: Partial<typeof result.data>) {
    const note = result.data.id ? result.data : { ...result.data, id: createId(), date, createdAt: nowIso() };
    await db.dailyNotes.put({ ...note, ...patch, updatedAt: nowIso() });
    touchData();
  }

  return { ...result, updateNote };
}

export function useMonthlyGoals(yearMonth: string) {
  const result = useDbQuery(() => db.monthlyGoals.where("yearMonth").equals(yearMonth).toArray(), [yearMonth], [] as MonthlyGoal[]);

  async function addGoal(input: { title: string; category?: GoalCategory; description?: string }) {
    const now = nowIso();
    await db.monthlyGoals.add({
      id: createId(),
      yearMonth,
      title: input.title,
      description: input.description,
      category: input.category ?? "other",
      progress: 0,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
    touchData();
  }

  async function updateGoal(id: string, patch: Partial<MonthlyGoal>) {
    await db.monthlyGoals.update(id, { ...patch, updatedAt: nowIso() });
    touchData();
  }

  async function deleteGoal(id: string) {
    await db.monthlyGoals.delete(id);
    touchData();
  }

  const averageProgress = result.data.length
    ? Math.round(result.data.reduce((sum, goal) => sum + (goal.completed ? 100 : goal.progress), 0) / result.data.length)
    : 0;

  return { ...result, addGoal, updateGoal, deleteGoal, averageProgress };
}

export function useMonthlyEvents(yearMonth: string) {
  const result = useDbQuery(() => db.monthlyEvents.where("yearMonth").equals(yearMonth).toArray(), [yearMonth], []);

  async function addEvent(input: { date: string; title: string; type?: "event" | "deadline" | "birthday" | "reminder"; color?: string }) {
    const now = nowIso();
    await db.monthlyEvents.add({
      id: createId(),
      yearMonth,
      date: input.date,
      title: input.title,
      type: input.type ?? "event",
      color: input.color ?? "#06b6d4",
      createdAt: now,
      updatedAt: now,
    });
    touchData();
  }

  async function deleteEvent(id: string) {
    await db.monthlyEvents.delete(id);
    touchData();
  }

  return { ...result, addEvent, deleteEvent };
}

export function useHabits() {
  const result = useDbQuery(() => db.habits.filter((habit) => !habit.archivedAt).toArray(), [], [] as Habit[]);

  async function addHabit(input: { name: string; stickerId: string; stickerEmoji: string; color: string; weeklyTarget?: number }) {
    await db.habits.add({
      id: createId(),
      name: input.name,
      stickerId: input.stickerId,
      stickerEmoji: input.stickerEmoji,
      color: input.color,
      frequency: "daily",
      weeklyTarget: input.weeklyTarget,
      createdAt: nowIso(),
    });
    touchData();
  }

  async function archiveHabit(id: string) {
    await db.habits.update(id, { archivedAt: nowIso() });
    touchData();
  }

  return { ...result, addHabit, archiveHabit };
}

export function useHabit(habitId: string) {
  return useDbQuery(() => db.habits.get(habitId), [habitId], undefined as Habit | undefined);
}

export function useHabitCheckins(habitId?: string, from?: string, to?: string) {
  const result = useDbQuery(async () => {
    let records = habitId ? await db.habitCheckins.where("habitId").equals(habitId).toArray() : await db.habitCheckins.toArray();
    if (from) records = records.filter((record) => record.date >= from);
    if (to) records = records.filter((record) => record.date <= to);
    return records;
  }, [habitId, from, to], [] as HabitCheckin[]);

  async function toggleCheckin(targetHabitId: string, date: string) {
    const existing = await db.habitCheckins.where("[habitId+date]").equals([targetHabitId, date]).first();
    if (existing) {
      await db.habitCheckins.delete(existing.id);
    } else {
      await db.habitCheckins.add({ id: createId(), habitId: targetHabitId, date, createdAt: nowIso() });
    }
    touchData();
  }

  async function updateCheckinNote(id: string, note: string) {
    await db.habitCheckins.update(id, { note });
    touchData();
  }

  return { ...result, toggleCheckin, updateCheckinNote };
}

export function useTodayHabits() {
  const habits = useHabits();
  const checkins = useHabitCheckins(undefined, todayKey(), todayKey());
  return { habits: habits.data, checkins: checkins.data, toggleCheckin: checkins.toggleCheckin, loading: habits.loading || checkins.loading };
}

export function useYearlyGoals(year: string) {
  const result = useDbQuery(() => db.yearlyGoals.where("year").equals(year).toArray(), [year], [] as YearlyGoal[]);

  async function addGoal(input: { title: string; category?: GoalCategory; targetMonth?: string; description?: string }) {
    const now = nowIso();
    await db.yearlyGoals.add({
      id: createId(),
      year,
      title: input.title,
      description: input.description,
      category: input.category ?? "other",
      targetMonth: input.targetMonth,
      progress: 0,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
    touchData();
  }

  async function updateGoal(id: string, patch: Partial<YearlyGoal>) {
    await db.yearlyGoals.update(id, { ...patch, updatedAt: nowIso() });
    touchData();
  }

  async function deleteGoal(id: string) {
    await db.yearlyGoals.delete(id);
    touchData();
  }

  return { ...result, addGoal, updateGoal, deleteGoal };
}

export function useMonthlySummary(yearMonth: string) {
  const result = useDbQuery(async () => {
    const existing = await db.monthlySummaries.where("yearMonth").equals(yearMonth).first();
    if (existing) return existing;
    const now = nowIso();
    const summary = { id: createId(), yearMonth, highlights: [], reflection: "", createdAt: now, updatedAt: now };
    await db.monthlySummaries.add(summary);
    return summary as MonthlySummary;
  }, [yearMonth], { id: "", yearMonth, highlights: [], reflection: "", createdAt: "", updatedAt: "" } as MonthlySummary);

  async function updateSummary(patch: Partial<MonthlySummary>) {
    await db.monthlySummaries.put({ ...result.data, ...patch, updatedAt: nowIso() });
    touchData();
  }

  return { ...result, updateSummary };
}

export function useYearlySummary(year: string) {
  const result = useDbQuery(async () => {
    const existing = await db.yearlySummaries.where("year").equals(year).first();
    if (existing) return existing;
    const now = nowIso();
    const summary = { id: createId(), year, yearlyWord: "", highlights: [], reflection: "", createdAt: now, updatedAt: now };
    await db.yearlySummaries.add(summary);
    return summary as YearlySummary;
  }, [year], { id: "", year, yearlyWord: "", highlights: [], reflection: "", createdAt: "", updatedAt: "" } as YearlySummary);

  async function updateSummary(patch: Partial<YearlySummary>) {
    await db.yearlySummaries.put({ ...result.data, ...patch, updatedAt: nowIso() });
    touchData();
  }

  return { ...result, updateSummary };
}

export function useMonthlyStats(yearMonth: string) {
  return useDbQuery(async () => {
    const [tasks, checkins, goals, notes] = await Promise.all([
      db.dailyTasks.where("date").between(`${yearMonth}-01`, `${yearMonth}-31`, true, true).toArray(),
      db.habitCheckins.where("date").between(`${yearMonth}-01`, `${yearMonth}-31`, true, true).toArray(),
      db.monthlyGoals.where("yearMonth").equals(yearMonth).toArray(),
      db.dailyNotes.where("date").between(`${yearMonth}-01`, `${yearMonth}-31`, true, true).toArray(),
    ]);
    const dailyHabitCounts = checkins.reduce<Record<string, number>>((acc, checkin) => {
      acc[checkin.date] = (acc[checkin.date] ?? 0) + 1;
      return acc;
    }, {});
    return {
      completedTasks: tasks.filter((task) => task.completed).length,
      habitCheckins: checkins.length,
      goalProgress: goals.length ? Math.round(goals.reduce((sum, goal) => sum + (goal.completed ? 100 : goal.progress), 0) / goals.length) : 0,
      recordedDays: notes.filter((note) => note.content || note.focus).length,
      dailyHabitCounts,
      goals,
    };
  }, [yearMonth], { completedTasks: 0, habitCheckins: 0, goalProgress: 0, recordedDays: 0, dailyHabitCounts: {}, goals: [] as MonthlyGoal[] });
}

export function useYearlyStats(year: string) {
  return useDbQuery(async () => {
    const [tasks, checkins, habits, goals] = await Promise.all([
      db.dailyTasks.where("date").between(`${year}-01-01`, `${year}-12-31`, true, true).toArray(),
      db.habitCheckins.where("date").between(`${year}-01-01`, `${year}-12-31`, true, true).toArray(),
      db.habits.toArray(),
      db.yearlyGoals.where("year").equals(year).toArray(),
    ]);
    const habitCounts = habits.map((habit) => ({
      name: habit.name,
      value: checkins.filter((checkin) => checkin.habitId === habit.id).length,
      color: habit.color,
    }));
    const activity = [...tasks.filter((task) => task.completed).map((task) => task.date), ...checkins.map((checkin) => checkin.date)].reduce<Record<string, number>>((acc, date) => {
      acc[date] = (acc[date] ?? 0) + 1;
      return acc;
    }, {});
    const bestHabit = habitCounts.sort((a, b) => b.value - a.value)[0];
    return {
      completedTasks: tasks.filter((task) => task.completed).length,
      habitCheckins: checkins.length,
      goalProgress: goals.length ? Math.round(goals.reduce((sum, goal) => sum + (goal.completed ? 100 : goal.progress), 0) / goals.length) : 0,
      bestHabit: bestHabit?.name ?? "还没有",
      habitCounts,
      activity,
      goals,
    };
  }, [year], { completedTasks: 0, habitCheckins: 0, goalProgress: 0, bestHabit: "还没有", habitCounts: [], activity: {}, goals: [] as YearlyGoal[] });
}

export function calculateStreak(checkins: HabitCheckin[], fromDate = todayKey()) {
  const dates = new Set(checkins.map((checkin) => checkin.date));
  let streak = 0;
  let current = parseISO(fromDate);
  while (dates.has(format(current, "yyyy-MM-dd"))) {
    streak += 1;
    current = addDays(current, -1);
  }
  return streak;
}

export function calculateWeekProgress(checkins: HabitCheckin[]) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = addDays(start, 6);
  return checkins.filter((checkin) => {
    const date = parseISO(checkin.date);
    return differenceInCalendarDays(date, start) >= 0 && differenceInCalendarDays(end, date) >= 0;
  }).length;
}

export async function exportAllData() {
  const [settings, dailyTasks, dailyNotes, monthlyGoals, monthlyEvents, yearlyGoals, habits, habitCheckins, monthlySummaries, yearlySummaries] =
    await Promise.all([
      db.settings.toArray(),
      db.dailyTasks.toArray(),
      db.dailyNotes.toArray(),
      db.monthlyGoals.toArray(),
      db.monthlyEvents.toArray(),
      db.yearlyGoals.toArray(),
      db.habits.toArray(),
      db.habitCheckins.toArray(),
      db.monthlySummaries.toArray(),
      db.yearlySummaries.toArray(),
    ]);
  return { settings, dailyTasks, dailyNotes, monthlyGoals, monthlyEvents, yearlyGoals, habits, habitCheckins, monthlySummaries, yearlySummaries };
}

export async function importAllData(data: Awaited<ReturnType<typeof exportAllData>>) {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
    await Promise.all([
      db.settings.bulkPut(data.settings ?? []),
      db.dailyTasks.bulkPut(data.dailyTasks ?? []),
      db.dailyNotes.bulkPut(data.dailyNotes ?? []),
      db.monthlyGoals.bulkPut(data.monthlyGoals ?? []),
      db.monthlyEvents.bulkPut(data.monthlyEvents ?? []),
      db.yearlyGoals.bulkPut(data.yearlyGoals ?? []),
      db.habits.bulkPut(data.habits ?? []),
      db.habitCheckins.bulkPut(data.habitCheckins ?? []),
      db.monthlySummaries.bulkPut(data.monthlySummaries ?? []),
      db.yearlySummaries.bulkPut(data.yearlySummaries ?? []),
    ]);
  });
  touchData();
}
