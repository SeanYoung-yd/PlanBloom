import type { ReactNode } from "react";
import { calendarDays, weekdayLabels } from "../utils/dates";

type CalendarGridProps = {
  yearMonth: string;
  weekStartsOn?: "monday" | "sunday";
  renderDay: (day: ReturnType<typeof calendarDays>[number]) => ReactNode;
};

export function CalendarGrid({ yearMonth, weekStartsOn = "monday", renderDay }: CalendarGridProps) {
  const days = calendarDays(yearMonth, weekStartsOn);
  const labels = weekStartsOn === "monday" ? weekdayLabels : ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div>
      <div className="pb-calendar-grid mb-2 gap-1 text-center text-xs font-bold text-bloom-muted">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="pb-calendar-grid gap-1">{days.map((day) => renderDay(day))}</div>
    </div>
  );
}
