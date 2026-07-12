import {
  addDays,
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from "date-fns";
import { zhCN } from "date-fns/locale";

export const todayKey = () => format(new Date(), "yyyy-MM-dd");
export const monthKey = (date = new Date()) => format(date, "yyyy-MM");
export const yearKey = (date = new Date()) => format(date, "yyyy");

export const formatDateTitle = (dateKey: string) =>
  format(parseISO(dateKey), "M月d日 EEEE", { locale: zhCN });

export const formatMonthTitle = (value: string) =>
  format(parseISO(`${value}-01`), "yyyy年M月", { locale: zhCN });

export const dateFromMonth = (value: string) => parseISO(`${value}-01`);

export const shiftDay = (dateKey: string, amount: number) =>
  format(addDays(parseISO(dateKey), amount), "yyyy-MM-dd");

export const shiftMonth = (value: string, amount: number) =>
  format(addMonths(dateFromMonth(value), amount), "yyyy-MM");

export const shiftYear = (value: string, amount: number) =>
  format(addYears(parseISO(`${value}-01-01`), amount), "yyyy");

export const previousYear = (value: string) => format(subYears(parseISO(`${value}-01-01`), 1), "yyyy");
export const nextYear = (value: string) => format(addYears(parseISO(`${value}-01-01`), 1), "yyyy");
export const previousMonth = (value: string) => format(subMonths(dateFromMonth(value), 1), "yyyy-MM");

export function calendarDays(yearMonth: string, weekStartsOn: "monday" | "sunday" = "monday") {
  const monthStart = startOfMonth(dateFromMonth(yearMonth));
  const monthEnd = endOfMonth(monthStart);
  const weekStartsOnNumber = weekStartsOn === "monday" ? 1 : 0;
  return eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: weekStartsOnNumber }),
    end: endOfWeek(monthEnd, { weekStartsOn: weekStartsOnNumber }),
  }).map((date) => ({
    date,
    key: format(date, "yyyy-MM-dd"),
    day: format(date, "d"),
    inMonth: format(date, "yyyy-MM") === yearMonth,
    isToday: isSameDay(date, new Date()),
  }));
}

export function daysInMonth(yearMonth: string) {
  const start = startOfMonth(dateFromMonth(yearMonth));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end }).map((date) => format(date, "yyyy-MM-dd"));
}

export const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];

export const hourSlots = Array.from({ length: 18 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00`);
